
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
    return <p className="p-8">Loading Dashboard...</p>;
  }

  if (error) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold">
          Admin Dashboard
        </h1>

        <p role="alert" className="mt-6 text-red-600">
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
    return <p className="p-8">Dashboard unavailable.</p>;
  }

  const pendingOrders =
    stats.ordersByStatus?.PENDING_PAYMENT ?? 0;

  const lowStockCount = stats.lowStockBooks.length;

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Welcome to MuchLogic Bookstore Administration
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-gray-500">Total Orders</p>

          <h2 className="mt-3 text-3xl font-bold text-gray-900">
            {stats.totalOrders}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-gray-500">Paid Orders</p>

          <h2 className="mt-3 text-3xl font-bold text-teal-700">
            {stats.paidOrders}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-gray-500">Total Sales</p>

          <h2 className="mt-3 text-2xl font-bold text-teal-700">
            {stats.currency === "LKR" ? "Rs." : stats.currency}{" "}
            {Number(stats.totalSales).toFixed(2)}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-gray-500">Low Stock Books</p>

          <h2 className="mt-3 text-3xl font-bold text-red-600">
            {lowStockCount}
          </h2>
        </div>
      </div>

      {/* Orders Summary */}
      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">
          Orders Summary
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-amber-50 p-5">
            <p className="text-gray-600">
              Pending Payments
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-700">
              {pendingOrders}
            </p>
          </div>

          <div className="rounded-lg bg-gray-100 p-5">
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
      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
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
                className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4"
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

                <span className="rounded-lg bg-red-50 px-4 py-2 font-medium text-red-700">
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
