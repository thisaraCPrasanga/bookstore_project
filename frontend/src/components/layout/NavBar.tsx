import { useState } from "react";
import { Link, NavLink, useMatch, useNavigate } from "react-router";
import { getAuthError } from "../../features/auth/api/auth-api";
import { useAuth } from "../../features/auth/context/authContext";

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
    isActive ? "bg-teal-50 text-teal-900" : "text-stone-700 hover:bg-stone-100 hover:text-teal-900"
  }`;
}

export default function NavBar() {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const catalogHome = useMatch("/") !== null;
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
    <header className="border-b border-stone-200 bg-white">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex min-h-10 shrink-0 items-center gap-2.5 self-start rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:self-auto">
          <span aria-hidden="true" className="grid size-9 place-items-center rounded-lg bg-teal-900 text-white">
            <span className="flex h-3.5 w-5">
              <span className="w-1/2 rounded-tl rounded-br-sm border border-current" />
              <span className="w-1/2 rounded-tr rounded-bl-sm border border-l-0 border-current" />
            </span>
          </span>
          <span>
            <span className="block font-serif text-xl leading-none font-semibold tracking-tight text-teal-950">MuchLogic</span>{" "}
            <span className="block text-xs leading-none font-medium text-stone-600">Bookstore</span>
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-1 sm:justify-end">
          <NavLink
            to="/books"
            className={({ isActive }) => navLinkClass({ isActive: isActive || catalogHome })}
          >
            Books
          </NavLink>

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
              className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-teal-900 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:opacity-60"
            >
              {isSigningOut ? "Logging out…" : "Logout"}
            </button>
          )}

          {!isLoading && !user && (
            <>
              <NavLink to="/login" className={navLinkClass}>Login</NavLink>
              <NavLink to="/register" className="inline-flex min-h-10 items-center rounded-lg bg-teal-800 px-3 text-sm font-semibold text-white hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 aria-[current=page]:bg-teal-950">
                Register
              </NavLink>
            </>
          )}
        </div>
      </nav>

      {logoutError && (
        <p role="alert" className="mx-auto max-w-7xl px-4 pb-3 text-sm text-red-800 sm:px-6 lg:px-8">
          {logoutError}
        </p>
      )}
    </header>
  );
}
