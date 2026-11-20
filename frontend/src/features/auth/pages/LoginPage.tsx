import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation } from "react-router";
import { getAuthError } from "../api/auth-api";
import { AuthField, AuthForm } from "../components/AuthForm";
import { useAuth } from "../context/authContext";
import type { AuthNavigationState } from "../routes/AuthRoutes";

export default function LoginPage() {
  const { signIn } = useAuth();
  const location = useLocation();
  const navigation = location.state as AuthNavigationState | null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    if (!password.trim()) {
      setError("Enter your password.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await signIn({ email: email.trim(), password });
    } catch (error) {
      setError(getAuthError(error, "Could not sign in. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthForm
      title="Login"
      description="Sign in to your bookstore account."
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Sign in"
      pendingLabel="Signing in…"
      error={error}
      notice={navigation?.registered ? "Your account is ready. Sign in to get started." : undefined}
      footer={(
        <>
          New to the bookstore?{" "}
          <Link to="/register" state={{ from: navigation?.from }} className="font-medium text-teal-700 underline">
            Create an account
          </Link>
        </>
      )}
    >
      <AuthField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <AuthField
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
    </AuthForm>
  );
}
