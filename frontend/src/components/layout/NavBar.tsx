import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { getAuthError } from "../../features/auth/api/auth-api";
import { useAuth } from "../../features/auth/context/authContext";

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `rounded-md px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-teal-700 ${
    isActive ? "bg-teal-50 text-teal-800" : "text-gray-700 hover:bg-gray-50 hover:text-teal-800"
  }`;
}

export default function NavBar() {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    if (isSigningOut) return;

    setIsSigningOut(true);
    setLogoutError("");

    try {
      await signOut();
      void navigate("/books", { replace: true });
    } catch (error) {
      setLogoutError(getAuthError(error, "Could not log out. Please try again."));
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link to="/" className="self-start rounded-md text-xl font-bold text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:self-auto">
          Bookstore
        </Link>

        <div className="flex flex-wrap items-center gap-1 sm:justify-end">
          <NavLink to="/books" className={navLinkClass}>Books</NavLink>

          {user?.role === "CUSTOMER" && (
            <>
              <NavLink to="/cart" className={navLinkClass}>Cart</NavLink>
              <NavLink to="/orders" className={navLinkClass}>My Orders</NavLink>
              <NavLink to="/downloads" className={navLinkClass}>Downloads</NavLink>
            </>
          )}

          {user && (
            <button
              type="button"
              onClick={handleLogout}
              disabled={isSigningOut}
              className="rounded-md px-3 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-teal-700 disabled:opacity-60"
            >
              {isSigningOut ? "Logging out…" : "Logout"}
            </button>
          )}

          {!isLoading && !user && (
            <>
              <NavLink to="/login" className={navLinkClass}>Login</NavLink>
              <NavLink to="/register" className={navLinkClass}>Register</NavLink>
            </>
          )}
        </div>
      </nav>

      {logoutError && (
        <p role="alert" className="mx-auto max-w-6xl px-4 pb-3 text-sm text-red-800 sm:px-6">
          {logoutError}
        </p>
      )}
    </header>
  );
}
