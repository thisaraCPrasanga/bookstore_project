import { Navigate, Outlet, useLocation } from "react-router";
import type { Path } from "react-router";
import { useAuth } from "../context/authContext";

export interface AuthNavigationState {
  from?: Path;
  registered?: boolean;
}

function CheckingSession() {
  return (
    <p role="status" className="mx-auto max-w-lg px-4 py-10 text-gray-600">
      Checking your session…
    </p>
  );
}

export function GuestRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigation = location.state as AuthNavigationState | null;

  if (isLoading) return <CheckingSession />;
  if (user) {
    const destination = user.role === "CUSTOMER" ? navigation?.from : undefined;
    return <Navigate to={destination ?? "/books"} replace />;
  }

  return <Outlet />;
}

export function RequireCustomer() {
  const { user, isLoading, sessionError, retrySession } = useAuth();
  const { pathname, search, hash } = useLocation();

  if (isLoading) return <CheckingSession />;
  if (sessionError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <p role="alert" className="text-red-800">{sessionError}</p>
        <button
          type="button"
          onClick={retrySession}
          className="mt-4 rounded-lg bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!user) {
    const state: AuthNavigationState = { from: { pathname, search, hash } };
    return <Navigate to="/login" replace state={state} />;
  }

  return user.role === "CUSTOMER" ? <Outlet /> : <Navigate to="/books" replace />;
}
