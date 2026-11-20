
import { useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load Admin Dashboard Statistics
  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const response = await api.get("/admin/stats");

        if (!cancelled) {
          setStats(response.data);
        }
      } catch (error) {
        console.error("Failed to load admin stats:", error);

        if (!cancelled) {
          if (error.response?.status === 401) {
            setError("Please login as an administrator.");
          } else if (error.response?.status === 403) {
            setError("You do not have admin permission.");
          } else {
            setError("Failed to load dashboard statistics.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="page-shell max-w-6xl text-sm text-gray-600">Loading Dashboard...</p>;
  }

  if (error) {
    return (
      <section className="page-shell max-w-6xl">
        <h1 className="page-title">
          Admin Dashboard
        </h1>

        <p role="alert" className="alert-error mt-5">
          {error}
        </p>

        <Link
          to="/login"
          className="mt-5 inline-block text-teal-700 hover:underline"
        >
          Go to Login
        </Link>
      </section>
    );
  }

  if (!stats) {
    return <p className="page-shell max-w-6xl text-sm text-gray-600">Dashboard unavailable.</p>;
  }

  const pendingOrders =
    stats.ordersByStatus?.PENDING_PAYMENT ?? 0;

  const lowStockCount = stats.lowStockBooks.length;

  return (
    <section className="page-shell max-w-6xl">

      {/* Page Header */}
      <div>
        <h1 className="page-title">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Welcome to MBook Administration
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="mt-5 grid gap-3 max-[360px]:grid-cols-1 min-[360px]:max-sm:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">

        <div className="surface min-w-0 p-4 max-sm:p-3 sm:p-5">
          <p className="flex items-center justify-between gap-1.5 text-sm font-medium text-gray-600">
            Total Orders
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="line-icon text-teal-700 max-sm:size-3.5">
              <path d="M9 5H6a1 1 0 0 0-1 1v14h14V6a1 1 0 0 0-1-1h-3" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 11h6m-6 4h6" />
            </svg>
          </p>

          <h2 className="mt-2 text-2xl font-bold tabular-nums">
            {stats.totalOrders}
          </h2>
        </div>

        <div className="surface min-w-0 p-4 max-sm:p-3 sm:p-5">
          <p className="flex items-center justify-between gap-1.5 text-sm font-medium text-gray-600">
            Paid Orders
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="line-icon text-teal-700 max-sm:size-3.5">
              <circle cx="12" cy="12" r="8" />
              <path d="m8.5 12 2.5 2.5 4.5-5" />
            </svg>
          </p>

          <h2 className="mt-2 text-2xl font-bold text-teal-800 tabular-nums">
            {stats.paidOrders}
          </h2>
        </div>

        <div className="surface min-w-0 p-4 max-sm:p-3 sm:p-5">
          <p className="flex items-center justify-between gap-1.5 text-sm font-medium text-gray-600">
            Total Sales
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="line-icon text-teal-700 max-sm:size-3.5">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 10h18M7 15h4" />
            </svg>
          </p>

          <h2 className="mt-2 text-2xl font-bold wrap-anywhere text-teal-800 tabular-nums">
            {stats.currency === "LKR" ? "Rs." : stats.currency}{" "}
            {Number(stats.totalSales).toFixed(2)}
          </h2>
        </div>

        <div className="surface min-w-0 p-4 max-sm:p-3 sm:p-5">
          <p className="flex items-center justify-between gap-1.5 text-sm font-medium text-gray-600">
            Low Stock Books
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="line-icon text-red-700 max-sm:size-3.5">
              <path d="M6 3h13v18H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 14h13m-7-10v4m0 3h.01" />
            </svg>
          </p>

          <h2 className="mt-2 text-2xl font-bold text-red-700 tabular-nums">
            {lowStockCount}
          </h2>
        </div>
      </div>

      {/* Orders Summary */}
      <div className="surface mt-5 p-4 sm:p-6">
        <h2 className="text-xl font-bold">
          Orders Summary
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
            <p className="text-gray-600">
              Pending Payments
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-700">
              {pendingOrders}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-gray-600">
              Processing Orders
            </p>

            <p className="mt-2 text-2xl font-bold">
              {stats.ordersByStatus?.PROCESSING ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Low Stock Books */}
      <div className="surface mt-5 p-4 sm:p-6">
        <h2 className="text-xl font-bold">
          Low Stock Alerts
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Books with stock at or below{" "}
          {stats.lowStockThreshold} units
        </p>

        {lowStockCount === 0 ? (
          <p className="mt-6 text-gray-600">
            No low stock books found.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {stats.lowStockBooks.map((book) => (
              <div
                key={book.bookId}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3 wrap-anywhere last:border-0 last:pb-0"
              >
                <div>
                  <Link
                    to={`/books/${book.bookId}`}
                    className="font-semibold text-teal-700 hover:underline"
                  >
                    {book.title}
                  </Link>

                  <p className="mt-1 text-sm text-gray-500">
                    {book.author}
                  </p>
                </div>

                <span className="status-label bg-red-50 text-red-800">
                  Stock: {book.stock}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </section>
  );
}
