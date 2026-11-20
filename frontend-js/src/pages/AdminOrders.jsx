
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
    <section className="mx-auto max-w-6xl px-6 py-12">

      {/* Header */}
      <Link
        to="/admin"
        className="text-teal-700 hover:underline"
      >
        ← Admin Dashboard
      </Link>

      <h1 className="mt-4 text-3xl font-bold">
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
          className="mt-6 rounded-lg bg-red-50 p-4 text-red-700"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="mt-6 rounded-lg bg-green-50 p-4 text-green-700"
        >
          {message}
        </p>
      )}

      {/* Orders Table */}
      <div className="mt-8 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Order Number</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
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
                  <td className="p-4">
                    <p className="font-semibold">
                      {order.orderNumber}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(
                        order.createdAt
                      ).toLocaleString("en-LK")}
                    </p>
                  </td>

                  <td className="p-4">
                    {order.customerEmail}
                  </td>

                  <td className="p-4 font-medium">
                    {order.currency === "LKR"
                      ? "Rs."
                      : order.currency}{" "}
                    {Number(order.totalAmount).toFixed(2)}
                  </td>

                  <td className="p-4">
                    <span className="rounded-full bg-gray-100 px-3 py-2 text-xs font-medium">
                      {order.status.replaceAll("_", " ")}
                    </span>
                  </td>

                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() =>
                        handleViewDetails(order.id)
                      }
                      disabled={loadingDetails || cancelling}
                      className="font-medium text-teal-700 hover:underline disabled:opacity-40"
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
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page === 0 || loading}
            onClick={() => {
              setPage((value) => value - 1);
              setSelectedOrder(null);
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 disabled:opacity-40"
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
            className="rounded-lg bg-teal-700 px-4 py-2 text-white disabled:opacity-40"
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
        <div className="mt-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                {selectedOrder.orderNumber}
              </h2>

              <p className="mt-2 text-gray-600">
                {selectedOrder.customerEmail}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100"
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
                  className="flex flex-wrap justify-between gap-4 border-b border-gray-100 pb-4"
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
                className="rounded-lg bg-red-600 px-6 py-3 font-medium text-white hover:bg-red-700 disabled:opacity-50"
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
