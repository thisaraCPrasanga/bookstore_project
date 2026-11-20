
import { useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router";

import api from "./services/api";

// Customer Pages
import BookList from "./pages/BookList";
import BookDetails from "./pages/BookDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import PaymentResult from "./pages/PaymentResult";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import MyEbooks from "./pages/MyEbooks";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminBooks from "./pages/AdminBooks";
import AdminOrders from "./pages/AdminOrders";
import AdminShipments from "./pages/AdminShipments";
import AdminUsers from "./pages/AdminUsers";

// Home Page
function HomePage() {
  return (
    <>
      <section className="bg-teal-700 px-6 py-20 text-center text-white">
        <h1 className="text-4xl font-bold">
          Discover Your Next Favorite Book
        </h1>

        <p className="mt-4 text-lg text-teal-100">
          Explore our collection of printed books and ebooks.
        </p>

        <a
          href="#books"
          className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-teal-800 hover:bg-gray-100"
        >
          Browse Books
        </a>
      </section>

      <section
        id="books"
        className="mx-auto max-w-6xl px-6 py-12"
      >
        <h2 className="text-2xl font-bold">
          Our Books
        </h2>

        <BookList />
      </section>
    </>
  );
}

// Protect Admin Pages
function AdminRoute({ user, checkingUser, children }) {
  if (checkingUser) {
    return (
      <p className="p-8 text-gray-600">
        Checking admin access...
      </p>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "ADMIN") {
    return (
      <section className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold text-red-600">
          Access Denied
        </h1>

        <p className="mt-4 text-gray-600">
          Only administrators can access this page.
        </p>

        <Link
          to="/"
          className="mt-5 inline-block text-teal-700 hover:underline"
        >
          Back to Home
        </Link>
      </section>
    );
  }

  return children;
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [checkingUser, setCheckingUser] = useState(true);

  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  // Check Login Status
  useEffect(() => {
    let cancelled = false;

    async function checkLoginStatus() {
      setCheckingUser(true);

      try {
        const response = await api.get("/users/me");

        if (!cancelled) {
          setUser(response.data);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setCheckingUser(false);
        }
      }
    }

    checkLoginStatus();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  // Logout
  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError("");

    try {
      await api.get("/auth/csrf");
      await api.post("/users/logout", {});

      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);

      setLogoutError(
        "Logout failed. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">

      {/* Navbar */}
      <header className="border-b border-gray-200 bg-white">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">

          <Link
            to="/"
            className="text-2xl font-bold text-teal-700"
          >
            MuchLogic Bookstore
          </Link>

          <div className="flex flex-wrap items-center gap-5">

            {/* Public Navigation */}
            <Link
              to="/books"
              className="text-gray-700 hover:text-teal-700"
            >
              Books
            </Link>

            {/* Customer Navigation */}
            {user?.role === "CUSTOMER" && (
              <>
                <Link
                  to="/cart"
                  className="text-gray-700 hover:text-teal-700"
                >
                  Cart
                </Link>

                <Link
                  to="/my-orders"
                  className="text-gray-700 hover:text-teal-700"
                >
                  My Orders
                </Link>

                <Link
                  to="/my-ebooks"
                  className="text-gray-700 hover:text-teal-700"
                >
                  My Ebooks
                </Link>
              </>
            )}

            {/* Admin Navigation */}
            {user?.role === "ADMIN" && (
              <>
                <Link
                  to="/admin"
                  className="font-medium text-teal-700 hover:underline"
                >
                  Dashboard
                </Link>

                <Link
                  to="/admin/books"
                  className="font-medium text-teal-700 hover:underline"
                >
                  Manage Books
                </Link>

                <Link
                  to="/admin/orders"
                  className="font-medium text-teal-700 hover:underline"
                >
                  Manage Orders
                </Link>

                <Link
                  to="/admin/shipments"
                  className="font-medium text-teal-700 hover:underline"
                >
                  Manage Shipments
                </Link>

                <Link
                  to="/admin/users"
                  className="font-medium text-teal-700 hover:underline"
                >
                  Manage Users
                </Link>
              </>
            )}

            {/* Authentication Navigation */}
            {checkingUser ? (
              <span className="text-gray-500">
                Checking...
              </span>
            ) : user ? (
              <>
                <span className="font-medium text-gray-700">
                  Hi, {user.firstName || user.email}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {loggingOut
                    ? "Logging out..."
                    : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/cart"
                  className="text-gray-700 hover:text-teal-700"
                >
                  Cart
                </Link>

                <Link
                  to="/login"
                  className="text-gray-700 hover:text-teal-700"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="text-gray-700 hover:text-teal-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>

        {logoutError && (
          <p
            role="alert"
            className="pb-3 text-center text-red-600"
          >
            {logoutError}
          </p>
        )}
      </header>

      {/* Application Routes */}
      <main className="flex-1">
        <Routes>

          {/* Public Pages */}
          <Route path="/" element={<HomePage />} />

          <Route path="/books" element={<HomePage />} />

          <Route
            path="/books/:id"
            element={<BookDetails />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* Customer Pages */}
          <Route
            path="/cart"
            element={<Cart />}
          />

          <Route
            path="/checkout"
            element={<Checkout />}
          />

          <Route
            path="/my-orders"
            element={<MyOrders />}
          />

          <Route
            path="/orders/:id"
            element={<OrderDetails />}
          />

          <Route
            path="/my-ebooks"
            element={<MyEbooks />}
          />

          {/* Payment Pages */}
          <Route
            path="/payment/return"
            element={<PaymentResult />}
          />

          <Route
            path="/payment/cancel"
            element={<PaymentResult />}
          />

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <AdminRoute
                user={user}
                checkingUser={checkingUser}
              >
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Admin Book Management */}
          <Route
            path="/admin/books"
            element={
              <AdminRoute
                user={user}
                checkingUser={checkingUser}
              >
                <AdminBooks />
              </AdminRoute>
            }
          />

          {/* Admin Order Management */}
          <Route
            path="/admin/orders"
            element={
              <AdminRoute
                user={user}
                checkingUser={checkingUser}
              >
                <AdminOrders />
              </AdminRoute>
            }
          />

          {/* Admin Shipment Management */}
          <Route
            path="/admin/shipments"
            element={
              <AdminRoute
                user={user}
                checkingUser={checkingUser}
              >
                <AdminShipments />
              </AdminRoute>
            }
          />

          {/* Admin User Management */}
          <Route
            path="/admin/users"
            element={
              <AdminRoute
                user={user}
                checkingUser={checkingUser}
              >
                <AdminUsers />
              </AdminRoute>
            }
          />

        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6 text-center text-gray-500">
        <p>
          © 2026 MuchLogic Bookstore. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
