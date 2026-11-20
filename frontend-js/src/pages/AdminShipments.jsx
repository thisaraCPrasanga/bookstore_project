
import { useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../services/api";

export default function AdminShipments() {
  const [shipments, setShipments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [refreshCount, setRefreshCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [selectedShipment, setSelectedShipment] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Load shipments
  useEffect(() => {
    let cancelled = false;

    async function loadShipments() {
      setLoading(true);

      try {
        const response = await api.get("/shipments", {
          params: {
            status: statusFilter || undefined,
            page,
            size: 10,
          },
        });

        if (!cancelled) {
          setShipments(response.data.content ?? []);
          setTotalPages(
            response.data.page?.totalPages ?? 0
          );
          setError("");
        }
      } catch (err) {
        console.error("Failed to load shipments:", err);

        if (!cancelled) {
          setShipments([]);

          if (err.response?.status === 403) {
            setError("Admin access is required.");
          } else {
            setError("Failed to load shipments.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadShipments();

    return () => {
      cancelled = true;
    };
  }, [page, statusFilter, refreshCount]);

  // Select a shipment
  function handleSelect(shipment) {
    setSelectedShipment(shipment);
    setTrackingNumber(shipment.trackingNumber ?? "");
    setError("");
    setMessage("");
  }

  // Change shipment status
  async function handleUpdate(nextStatus) {
    if (!selectedShipment || updating) {
      return;
    }

    const allowed =
      (selectedShipment.status === "PENDING" &&
        nextStatus === "SHIPPED") ||
      (selectedShipment.status === "SHIPPED" &&
        nextStatus === "DELIVERED");

    if (!allowed) {
      setError("Invalid shipment status change.");
      return;
    }

    const confirmed = window.confirm(
      `Mark shipment #${selectedShipment.id} as ${nextStatus}?`
    );

    if (!confirmed) {
      return;
    }

    setUpdating(true);
    setError("");
    setMessage("");

    try {
      // Get CSRF cookie
      await api.get("/auth/csrf");

      const response = await api.patch(
        `/shipments/${selectedShipment.id}`,
        {
          status: nextStatus,
          trackingNumber:
            nextStatus === "SHIPPED"
              ? trackingNumber.trim() || null
              : null,
        }
      );

      const updatedShipment = response.data;

      setSelectedShipment(updatedShipment);
      setTrackingNumber(
        updatedShipment.trackingNumber ?? ""
      );

      setMessage(
        `Shipment successfully marked as ${nextStatus}.`
      );

      // Reload shipment list
      setRefreshCount((count) => count + 1);

    } catch (err) {
      console.error("Shipment update failed:", err);

      setError(
        err.response?.data?.detail ||
        "Failed to update shipment."
      );
    } finally {
      setUpdating(false);
    }
  }

  function changeFilter(event) {
    setStatusFilter(event.target.value);
    setPage(0);
    setSelectedShipment(null);
    setMessage("");
    setError("");
  }

  function changePage(nextPage) {
    setPage(nextPage);
    setSelectedShipment(null);
    setMessage("");
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
        Manage Shipments
      </h1>

      <p className="mt-2 text-gray-600">
        Manage shipping and delivery of printed books.
      </p>

      {/* Status Filter */}
      <div className="surface mt-5 p-4 sm:p-5">
        <label
          htmlFor="shipment-status-filter"
          className="form-label"
        >
          Filter by Status
        </label>

        <select
          id="shipment-status-filter"
          value={statusFilter}
          onChange={changeFilter}
          className="form-field w-full sm:max-w-xs"
        >
          <option value="">All Shipments</option>
          <option value="PENDING">Pending</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
        </select>
      </div>

      {/* Feedback */}
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

      {/* Shipment Table */}
      <div className="surface table-scroll mt-5">
        <table className="admin-table">

          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-4 py-3">Shipment ID</th>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Customer</th>
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
                  Loading shipments...
                </td>
              </tr>
            ) : shipments.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-gray-500"
                >
                  No shipments found.
                </td>
              </tr>
            ) : (
              shipments.map((shipment) => (
                <tr
                  key={shipment.id}
                  className="border-t border-gray-200"
                >
                  <td className="px-4 py-3 font-semibold">
                    #{shipment.id}
                  </td>

                  <td className="px-4 py-3">
                    #{shipment.orderId}
                  </td>

                  <td className="px-4 py-3">
                    {shipment.address?.fullName ?? "N/A"}
                  </td>

                  <td className="px-4 py-3">
                    <span className="status-label">
                      {shipment.status}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleSelect(shipment)}
                      className="button button-secondary whitespace-nowrap"
                    >
                      Manage
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
            onClick={() => changePage(page - 1)}
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
            onClick={() => changePage(page + 1)}
            className="button button-primary"
          >
            Next
          </button>
        </div>
      )}

      {/* Selected Shipment */}
      {selectedShipment && (
        <div className="surface mt-6 p-4 sm:p-6">

          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Shipment #{selectedShipment.id}
            </h2>

            <button
              type="button"
              disabled={updating}
              onClick={() => setSelectedShipment(null)}
              className="button button-secondary"
            >
              Close
            </button>
          </div>

          {/* Shipment Information */}
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                Order ID
              </p>

              <p className="mt-1 font-semibold">
                #{selectedShipment.orderId}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Status
              </p>

              <p className="mt-1 font-semibold">
                {selectedShipment.status}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Created At
              </p>

              <p className="mt-1">
                {new Date(
                  selectedShipment.createdAt
                ).toLocaleString("en-LK")}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Tracking Number
              </p>

              <p className="mt-1 font-semibold">
                {selectedShipment.trackingNumber || "Not assigned"}
              </p>
            </div>
          </div>

          {/* Delivery Address */}
          {selectedShipment.address && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold">
                Delivery Address
              </h3>

              <div className="mt-4 space-y-1 text-gray-700">
                <p>{selectedShipment.address.fullName}</p>
                <p>{selectedShipment.address.phone}</p>
                <p>
                  {selectedShipment.address.addressLine1}
                </p>

                {selectedShipment.address.addressLine2 && (
                  <p>
                    {selectedShipment.address.addressLine2}
                  </p>
                )}

                <p>
                  {selectedShipment.address.city}{" "}
                  {selectedShipment.address.postalCode}
                </p>
              </div>
            </div>
          )}

          {/* Mark as Shipped */}
          {selectedShipment.status === "PENDING" && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold">
                Ship Parcel
              </h3>

              <label
                htmlFor="tracking-number"
                className="mt-4 block font-medium"
              >
                Tracking Number (Optional)
              </label>

              <input
                id="tracking-number"
                type="text"
                value={trackingNumber}
                onChange={(event) =>
                  setTrackingNumber(event.target.value)
                }
                maxLength={50}
                placeholder="Enter tracking number"
                className="form-field mt-2 w-full sm:max-w-md"
              />

              <div className="mt-5">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleUpdate("SHIPPED")}
                  className="button button-primary"
                >
                  {updating
                    ? "Updating..."
                    : "Mark as Shipped"}
                </button>
              </div>
            </div>
          )}

          {/* Mark as Delivered */}
          {selectedShipment.status === "SHIPPED" && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <p className="mb-4 text-gray-600">
                Confirm that this parcel has been delivered
                to the customer.
              </p>

              <button
                type="button"
                disabled={updating}
                onClick={() => handleUpdate("DELIVERED")}
                className="button button-primary"
              >
                {updating
                  ? "Updating..."
                  : "Mark as Delivered"}
              </button>
            </div>
          )}

          {/* Completed Shipment */}
          {selectedShipment.status === "DELIVERED" && (
            <div className="alert-success mt-6">
              This shipment has been delivered successfully.
            </div>
          )}

          {/* Shipment Dates */}
          {(selectedShipment.shippedAt ||
            selectedShipment.deliveredAt) && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              {selectedShipment.shippedAt && (
                <p className="text-sm text-gray-600">
                  Shipped:{" "}
                  {new Date(
                    selectedShipment.shippedAt
                  ).toLocaleString("en-LK")}
                </p>
              )}

              {selectedShipment.deliveredAt && (
                <p className="mt-2 text-sm text-gray-600">
                  Delivered:{" "}
                  {new Date(
                    selectedShipment.deliveredAt
                  ).toLocaleString("en-LK")}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
