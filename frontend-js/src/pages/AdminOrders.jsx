
import { useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../services/api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Load all orders
  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/orders", {
          params: {
            page,
            size: 10,
          },
        });

        if (!cancelled) {
          setOrders(response.data.content ?? []);
          setTotalPages(
            response.data.page?.totalPages ?? 0
          );
        }
      } catch (err) {
        console.error("Failed to load orders:", err);

        if (!cancelled) {
          setError("Failed to load orders.");
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

  // Load details of a selected order
  async function handleViewDetails(orderId) {
    setLoadingDetails(true);
    setError("");
    setMessage("");
    setSelectedOrder(null);

    try {
      const response = await api.get(`/orders/${orderId}`);

      setSelectedOrder(response.data);
    } catch (err) {
      console.error("Failed to load order:", err);

      setError(
        err.response?.data?.detail ||
        "Failed to load order details."
      );
    } finally {
      setLoadingDetails(false);
    }
  }

  // Cancel an unpaid order
  async function handleCancelOrder() {
    if (
      !selectedOrder ||
      selectedOrder.status !== "PENDING_PAYMENT" ||
      cancelling
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Cancel order ${selectedOrder.orderNumber}?`
    );

    if (!confirmed) return;

    setCancelling(true);
    setError("");
    setMessage("");

    try {
      // Obtain CSRF cookie
      await api.get("/auth/csrf");

      const response = await api.patch(
        `/orders/${selectedOrder.id}/status`,
        {
          status: "CANCELLED",
          note: "Cancelled by administrator",
        }
      );

      // Update selected order
      setSelectedOrder(response.data);

      // Update the order in the list
      setOrders((previous) =>
        previous.map((order) =>
          order.id === response.data.id
            ? {
                ...order,
                status: response.data.status,
              }
            : order
        )
      );

      setMessage("Order cancelled successfully.");
    } catch (err) {
      console.error("Failed to cancel order:", err);

      setError(
        err.response?.data?.detail ||
        "Failed to cancel order. Please reload."
      );
    } finally {
      setCancelling(false);
    }
  }

  return (
    <section className="page-shell max-w-6xl">

      {/* Header */}
      <Link
        to="/admin"
        className="text-teal-700 hover:underline"
      >
        ← Admin Dashboard
      </Link>

      <h1 className="page-title mt-4">
        Manage Orders
      </h1>

      <p className="mt-2 text-gray-600">
        View customer orders, payment statuses,
        and order details.
      </p>

      {/* Messages */}
      {error && (
        <p
          role="alert"
          className="alert-error mt-5"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="alert-success mt-5"
        >
          {message}
        </p>
      )}

      {/* Orders Table */}
      <div className="surface table-scroll mt-5">
        <table className="admin-table">

          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-4 py-3">Order Number</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center"
                >
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center"
                >
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-t border-gray-200"
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold">
                      {order.orderNumber}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(
                        order.createdAt
                      ).toLocaleString("en-LK")}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    {order.customerEmail}
                  </td>

                  <td className="px-4 py-3 font-medium tabular-nums">
                    {order.currency === "LKR"
                      ? "Rs."
                      : order.currency}{" "}
                    {Number(order.totalAmount).toFixed(2)}
                  </td>

                  <td className="px-4 py-3">
                    <span className="status-label">
                      {order.status.replaceAll("_", " ")}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleViewDetails(order.id)
                      }
                      disabled={loadingDetails || cancelling}
                      className="button button-secondary whitespace-nowrap"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            disabled={page === 0 || loading}
            onClick={() => {
              setPage((value) => value - 1);
              setSelectedOrder(null);
            }}
            className="button button-secondary"
          >
            Previous
          </button>

          <span>
            Page {page + 1} of {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => {
              setPage((value) => value + 1);
              setSelectedOrder(null);
            }}
            className="button button-primary"
          >
            Next
          </button>
        </div>
      )}

      {loadingDetails && (
        <p className="mt-8 text-gray-600">
          Loading order details...
        </p>
      )}

      {/* Selected Order Details */}
      {selectedOrder && !loadingDetails && (
        <div className="surface mt-6 p-4 sm:p-6">

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                {selectedOrder.orderNumber}
              </h2>

              <p className="mt-2 text-gray-600">
                {selectedOrder.customerEmail}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="button button-secondary"
            >
              Close
            </button>
          </div>

          {/* Order Information */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                Order Status
              </p>

              <p className="mt-1 font-semibold">
                {selectedOrder.status.replaceAll("_", " ")}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Order Date
              </p>

              <p className="mt-1 font-semibold">
                {new Date(
                  selectedOrder.createdAt
                ).toLocaleString("en-LK")}
              </p>
            </div>
          </div>

          {/* Delivery Address */}
          {selectedOrder.address && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold">
                Delivery Address
              </h3>

              <p className="mt-3">
                {selectedOrder.address.fullName}
              </p>

              <p>{selectedOrder.address.phone}</p>

              <p>
                {selectedOrder.address.addressLine1}
              </p>

              {selectedOrder.address.addressLine2 && (
                <p>
                  {selectedOrder.address.addressLine2}
                </p>
              )}

              <p>
                {selectedOrder.address.city},{" "}
                {selectedOrder.address.postalCode}
              </p>

              <p>{selectedOrder.address.country}</p>
            </div>
          )}

          {/* Ordered Books */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold">
              Ordered Books
            </h3>

            <div className="mt-4 space-y-4">
              {selectedOrder.items.map((item) => (
                <div
                  key={item.bookId}
                  className="flex flex-wrap justify-between gap-3 border-b border-gray-200 pb-3 wrap-anywhere last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-semibold">
                      {item.bookTitle}
                    </p>

                    <p className="text-sm text-gray-500">
                      {item.bookFormat} · Qty: {item.quantity}
                    </p>

                    <p className="text-sm text-gray-500">
                      Fulfilment:{" "}
                      {item.fulfilmentStatus}
                    </p>
                  </div>

                  <p className="font-semibold">
                    Rs.{" "}
                    {Number(item.lineTotal).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="mt-6 space-y-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>
                Rs.{" "}
                {Number(
                  selectedOrder.subtotal
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>
                Rs.{" "}
                {Number(
                  selectedOrder.deliveryFee
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between border-t border-gray-200 pt-4 text-xl font-bold">
              <span>Total</span>
              <span className="text-teal-700">
                Rs.{" "}
                {Number(
                  selectedOrder.totalAmount
                ).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Cancel Unpaid Order */}
          {selectedOrder.status === "PENDING_PAYMENT" && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <p className="mb-4 text-sm text-gray-600">
                Only unpaid orders can be cancelled
                from this page.
              </p>

              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="button button-danger"
              >
                {cancelling
                  ? "Cancelling..."
                  : "Cancel Unpaid Order"}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
