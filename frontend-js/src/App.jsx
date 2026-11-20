
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
      <section className="page-shell grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] justify-items-start gap-2 pb-0 sm:gap-x-5 sm:pb-0">
        <h1 className="page-title col-span-2 sm:col-span-1">
          Discover Your Next Favorite Book
        </h1>

        <p className="col-span-2 row-start-2 text-sm text-gray-600 sm:col-span-1 sm:text-base">
          Explore our collection of printed books and ebooks.
        </p>

        <a
          href="#books"
          className="button button-secondary col-start-1 row-start-3 self-center"
        >
          Browse Books
        </a>

        <span
          aria-hidden="true"
          className="hero-books col-start-2 row-start-3 sm:row-span-3 sm:row-start-1"
        >
          <span />
        </span>
      </section>

      <section
        id="books"
        className="page-shell max-w-6xl pt-5 sm:pt-6"
      >
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
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
      <p className="page-shell max-w-6xl text-sm text-gray-600">
        Checking admin access...
      </p>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "ADMIN") {
    return (
      <section className="page-shell max-w-4xl">
        <h1 className="page-title text-red-700">
          Access Denied
        </h1>

        <p className="mt-3 text-gray-600">
          Only administrators can access this page.
        </p>

        <Link
          to="/"
          className="button button-secondary mt-5"
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
    <div className="flex min-h-screen flex-col bg-gray-100">

      {/* Navbar */}
      <header className="border-b border-gray-200 bg-white shadow-xs">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 max-sm:py-2 sm:px-6">

          <Link
            to="/"
            className="inline-flex min-h-9 items-center rounded-lg text-xl font-bold tracking-tight text-teal-800 sm:text-2xl"
          >
            MBook
          </Link>

          <div className="flex w-full flex-wrap items-center gap-1 max-sm:gap-y-0 max-lg:min-w-0 max-lg:max-w-full sm:w-auto">

            {/* Public Navigation */}
            <Link
              to="/books"
              className="nav-link"
            >
              Books
            </Link>

            {/* Customer Navigation */}
            {user?.role === "CUSTOMER" && (
              <>
                <Link
                  to="/cart"
                  className="nav-link"
                >
                  Cart
                </Link>

                <Link
                  to="/my-orders"
                  className="nav-link"
                >
                  My Orders
                </Link>

                <Link
                  to="/my-ebooks"
                  className="nav-link"
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
                  className="nav-link"
                >
                  Dashboard
                </Link>

                <Link
                  to="/admin/books"
                  className="nav-link"
                >
                  Manage Books
                </Link>

                <Link
                  to="/admin/orders"
                  className="nav-link"
                >
                  Manage Orders
                </Link>

                <Link
                  to="/admin/shipments"
                  className="nav-link"
                >
                  Manage Shipments
                </Link>

                <Link
                  to="/admin/users"
                  className="nav-link"
                >
                  Manage Users
                </Link>
              </>
            )}

            {/* Authentication Navigation */}
            {checkingUser ? (
              <span className="px-2.5 text-sm text-gray-500">
                Checking...
              </span>
            ) : user ? (
              <>
                <span className="px-2.5 py-1.5 text-sm font-medium wrap-anywhere text-gray-700">
                  Hi, {user.firstName || user.email}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="button button-secondary ml-1 min-h-9 max-sm:min-h-11"
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
                  className="nav-link"
                >
                  Cart
                </Link>

                <Link
                  to="/login"
                  className="nav-link"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="nav-link"
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
            className="alert-error mx-4 mb-3 sm:mx-auto sm:w-fit"
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
      <footer className="border-t border-gray-200 bg-white px-4 py-5 text-center text-sm text-gray-600">
        <p>
          © 2026 MBook. All rights reserved.
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
