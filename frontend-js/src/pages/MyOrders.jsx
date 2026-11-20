
import { useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../services/api";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loginRequired, setLoginRequired] = useState(false);

  // Load customer's orders
  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/orders/my", {
          params: {
            page,
            size: 5,
            sort: "createdAt,desc",
          },
        });

        if (!cancelled) {
          setOrders(response.data.content);
          setTotalPages(response.data.page.totalPages);
        }
      } catch (error) {
        console.error("Failed to load orders:", error);

        if (!cancelled) {
          if (error.response?.status === 401) {
            setLoginRequired(true);
          } else if (error.response?.status === 403) {
            setError("Only customers can view their orders.");
          } else {
            setError("Failed to load your orders.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [page]);

  if (loginRequired) {
    return (
      <section className="page-shell max-w-5xl">
        <h1 className="page-title">
          My Orders
        </h1>

        <p className="mt-6">
          Please login to view your orders.
        </p>

        <Link
          to="/login"
          className="button button-primary mt-5 max-sm:w-full"
        >
          Login
        </Link>
      </section>
    );
  }

  return (
    <section className="page-shell max-w-5xl">
      <h1 className="page-title">
        My Orders
      </h1>

      <p className="mt-2 text-gray-600">
        View your previous orders and payment status.
      </p>

      {/* Loading */}
      {loading && (
        <p className="mt-8 text-gray-600">
          Loading your orders...
        </p>
      )}

      {/* Error */}
      {error && (
        <p
          role="alert"
          className="alert-error mt-5"
        >
          {error}
        </p>
      )}

      {/* Empty Orders */}
      {!loading && !error && orders.length === 0 && (
        <div className="surface mt-5 p-6 text-center sm:p-8">
          <p className="text-gray-600">
            You have not placed any orders yet.
          </p>

          <Link
            to="/books"
            className="button button-primary mt-5 max-sm:w-full"
          >
            Browse Books
          </Link>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && orders.length > 0 && (
        <>
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="surface min-w-0 p-4 wrap-anywhere sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {order.orderNumber}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      Order Date:{" "}
                      {new Date(order.createdAt).toLocaleString("en-LK")}
                    </p>
                  </div>

                  <span className="status-label">
                    {order.status.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="mt-5 border-t border-gray-200 pt-5">
                  <p className="text-gray-600">
                    Customer: {order.customerEmail}
                  </p>

                  <p className="mt-3 text-xl font-bold text-teal-700">
                    {order.currency === "LKR"
                      ? "Rs."
                      : order.currency}{" "}
                    {Number(order.totalAmount).toFixed(2)}
                  </p>

                  {order.status === "PENDING_PAYMENT" && (
                    <p className="mt-3 text-sm text-amber-700">
                      Payment is pending for this order.
                    </p>
                  )}

                  {order.status === "PAID" && (
                    <p className="mt-3 text-sm text-green-700">
                      Payment confirmed.
                    </p>
                  )}

                  {/* View Details Button */}
                  <Link
                    to={`/orders/${order.id}`}
                    className="button button-primary mt-5 max-sm:w-full"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                disabled={page === 0 || loading}
                onClick={() => setPage(page - 1)}
                className="button button-secondary"
              >
                Previous
              </button>

              <span className="text-gray-700">
                Page {page + 1} of {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages - 1 || loading}
                onClick={() => setPage(page + 1)}
                className="button button-primary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
