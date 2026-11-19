import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { getAuthError, register } from "../api/auth-api";
import { AuthField, AuthForm } from "../components/AuthForm";
import type { AuthNavigationState } from "../routes/AuthRoutes";

export default function RegisterPage() {
  const location = useLocation();
  const navigation = location.state as AuthNavigationState | null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const fields = new FormData(event.currentTarget);
    const firstName = String(fields.get("firstName") ?? "").trim();
    const lastName = String(fields.get("lastName") ?? "").trim();
    const email = String(fields.get("email") ?? "").trim();
    const password = String(fields.get("password") ?? "");

    if (!firstName || !lastName || !password.trim()) {
      setError("Enter your first name, last name, and password.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await register({ firstName, lastName, email, password });
      setRegistered(true);
    } catch (error) {
      setError(getAuthError(error, "Could not create your account. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (registered) {
    return <Navigate to="/login" replace state={{ registered: true, from: navigation?.from }} />;
  }

  return (
    <AuthForm
      title="Create an account"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Register"
      pendingLabel="Creating account…"
      error={error}
      footer={(
        <>
          Already have an account?{" "}
          <Link to="/login" state={{ from: navigation?.from }} className="font-medium text-teal-700 underline">
            Sign in
          </Link>
        </>
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <AuthField name="firstName" label="First name" autoComplete="given-name" maxLength={100} />
        <AuthField name="lastName" label="Last name" autoComplete="family-name" maxLength={100} />
      </div>
      <AuthField name="email" label="Email" type="email" autoComplete="email" maxLength={255} />
      <AuthField
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        maxLength={72}
        hint="Use 8 to 72 characters."
      />
    </AuthForm>
  );
}
