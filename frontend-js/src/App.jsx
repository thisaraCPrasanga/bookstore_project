
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
      <section className="relative isolate overflow-hidden bg-gray-100 pb-4 md:pb-0">
        <div className="page-shell relative z-10 flex max-w-6xl flex-col justify-center py-5 md:min-h-[clamp(14rem,16.67vw,20rem)] md:py-9">
          <div className="md:max-w-[56%]">
            <h1 className="page-title xl:text-4xl">
              Discover Your Next Favorite Book
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base lg:text-lg">
              Explore our collection of printed books and ebooks.
            </p>
          </div>
        </div>

        <img
          src="/images/mbook-hero-books.webp"
          alt="An open book, stacked hardcovers, and a mug on a sunlit library table"
          width="1800"
          height="600"
          className="hero-books"
        />
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
  const [menuLocation, setMenuLocation] = useState(null);

  // A new location closes the menu, including browser back and forward navigation.
  const mobileMenuOpen = menuLocation === location;

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

  function handleNavigationKeyDown(event) {
    if (event.key === "Escape" && mobileMenuOpen) {
      event.preventDefault();
      setMenuLocation(null);
      event.currentTarget.querySelector('button[aria-controls="site-navigation"]')?.focus();
    }
  }

  // Logout
  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError("");

    try {
      await api.get("/auth/csrf");
      await api.post("/users/logout", {});

      setUser(null);
      setMenuLocation(null);
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
        <nav
          aria-label="Main navigation"
          onKeyDown={handleNavigationKeyDown}
          className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 max-sm:py-2 sm:px-6"
        >

          <Link
            to="/"
            className="inline-flex min-h-9 items-center gap-2 rounded-lg text-xl font-bold tracking-tight text-teal-800 sm:text-2xl"
          >
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="line-icon size-5">
              <path d="M6 3h13v18H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 14h13M9 7h6m-6 4h4" />
            </svg>
            MBook
          </Link>

          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="site-navigation"
            onClick={() => setMenuLocation(mobileMenuOpen ? null : location)}
            className="button button-secondary size-11 shrink-0 p-0 text-teal-700 md:hidden"
          >
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="line-icon size-5">
              <path d={mobileMenuOpen ? "m6 6 12 12M18 6 6 18" : "M5 6h14M5 12h14M5 18h14"} />
            </svg>
          </button>

          <div
            id="site-navigation"
            className={`site-navigation gap-1 max-lg:min-w-0 max-lg:max-w-full md:flex md:w-auto md:flex-wrap md:items-center ${mobileMenuOpen ? "flex" : "hidden"}`}
          >

            {/* Public Navigation */}
            <Link
              to="/books"
              className="nav-link"
            >
              <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="line-icon">
                <path d="M12 6c-2.5-1.7-5.5-2.2-9-1v13c3.5-1.2 6.5-.7 9 1 2.5-1.7 5.5-2.2 9-1V5c-3.5-1.2-6.5-.7-9 1Zm0 0v13" />
              </svg>
              Books
            </Link>

            {/* Customer Navigation */}
            {user?.role === "CUSTOMER" && (
              <>
                <Link
                  to="/cart"
                  className="nav-link"
                >
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="line-icon">
                    <path d="M3 4h2l2.5 11h11l2-7H6" />
                    <circle cx="9" cy="19" r="1" />
                    <circle cx="17" cy="19" r="1" />
                  </svg>
                  Cart
                </Link>

                <Link
                  to="/my-orders"
                  className="nav-link"
                >
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="line-icon">
                    <rect x="5" y="3" width="14" height="18" rx="2" />
                    <path d="M9 8h6m-6 4h6m-6 4h4" />
                  </svg>
                  My Orders
                </Link>

                <Link
                  to="/my-ebooks"
                  className="nav-link"
                >
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="line-icon">
                    <rect x="5" y="3" width="14" height="18" rx="2" />
                    <path d="M9 7h6m-6 4h6m-3 6h.01" />
                  </svg>
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
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="line-icon">
                    <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
                  </svg>
                  Dashboard
                </Link>

                <Link
                  to="/admin/books"
                  className="nav-link"
                >
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="line-icon">
                    <path d="M4 4h4v16H4zM8 4h4v16H8zM14 5l4-1 4 15-4 1z" />
                  </svg>
                  Manage Books
                </Link>

                <Link
                  to="/admin/orders"
                  className="nav-link"
                >
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="line-icon">
                    <path d="M9 5H6a1 1 0 0 0-1 1v14h14V6a1 1 0 0 0-1-1h-3m-6 9 2 2 4-4" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                  </svg>
                  Manage Orders
                </Link>

                <Link
                  to="/admin/shipments"
                  className="nav-link"
                >
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="line-icon">
                    <path d="M4 16H3V6h11v10H8m6-7h4l3 4v3h-2m-4 0h-1" />
                    <circle cx="6" cy="16" r="2" />
                    <circle cx="17" cy="16" r="2" />
                  </svg>
                  Manage Shipments
                </Link>

                <Link
                  to="/admin/users"
                  className="nav-link"
                >
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="line-icon">
                    <circle cx="9" cy="8" r="3" />
                    <path d="M3 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2m2-14a3 3 0 0 1 0 6m.5 2a4 4 0 0 1 3.5 4v2" />
                  </svg>
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
                  className="button button-secondary ml-1 min-h-9 gap-1.5 max-md:ml-0 max-md:min-h-11 max-md:justify-start max-md:px-3"
                >
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="line-icon text-teal-700">
                    <path d="M10 4H5v16h5m0-8h11m-4-4 4 4-4 4" />
                  </svg>
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
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="line-icon">
                    <path d="M3 4h2l2.5 11h11l2-7H6" />
                    <circle cx="9" cy="19" r="1" />
                    <circle cx="17" cy="19" r="1" />
                  </svg>
                  Cart
                </Link>

                <Link
                  to="/login"
                  className="nav-link"
                >
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="line-icon">
                    <path d="M13 4h6v16h-6M4 12h11m-4-4 4 4-4 4" />
                  </svg>
                  Login
                </Link>

                <Link
                  to="/register"
                  className="nav-link"
                >
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="line-icon">
                    <circle cx="9" cy="7" r="3" />
                    <path d="M3 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2m4-14v6m-3-3h6" />
                  </svg>
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
      <footer className="border-t border-gray-200 bg-white text-sm text-gray-600">
        <div className="page-shell flex max-w-6xl flex-col items-center gap-3 py-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="space-y-1">
            <p className="text-base font-bold tracking-tight text-teal-800">MBook</p>
            <p>© {new Date().getFullYear()} MBook. All rights reserved.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:justify-end">
            <p>Developed by Thisara C. Prasanga</p>
            <a
              href="https://www.linkedin.com/in/thisara-prasanga-55bb77321"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-sm font-medium text-teal-700 hover:text-teal-800 hover:underline sm:min-h-9"
            >
              <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="size-4 shrink-0 fill-current">
                <path d="M20.45 20.45H16.9v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
              </svg>
              LinkedIn<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
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
