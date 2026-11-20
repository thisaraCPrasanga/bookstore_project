
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
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold">
          My Orders
        </h1>

        <p className="mt-6">
          Please login to view your orders.
        </p>

        <Link
          to="/login"
          className="mt-5 inline-block rounded-lg bg-teal-700 px-6 py-3 text-white"
        >
          Login
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900">
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
          className="mt-6 rounded-lg bg-red-50 p-4 text-red-700"
        >
          {error}
        </p>
      )}

      {/* Empty Orders */}
      {!loading && !error && orders.length === 0 && (
        <div className="mt-8 rounded-xl bg-white p-8 text-center">
          <p className="text-gray-600">
            You have not placed any orders yet.
          </p>

          <Link
            to="/books"
            className="mt-5 inline-block rounded-lg bg-teal-700 px-6 py-3 text-white"
          >
            Browse Books
          </Link>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && orders.length > 0 && (
        <>
          <div className="mt-8 space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
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

                  <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
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
                    className="mt-5 inline-block rounded-lg bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={page === 0 || loading}
                onClick={() => setPage(page - 1)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 disabled:opacity-40"
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
                className="rounded-lg bg-teal-700 px-4 py-2 text-white disabled:opacity-40"
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
