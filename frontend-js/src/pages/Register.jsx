
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(event) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Get CSRF token before registration
      await api.get("/auth/csrf");

      // Send registration data to backend
      await api.post("/users/register", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password: password,
      });

      // Registration successful
      navigate("/login");

    } catch (error) {
      console.error("Registration failed:", error);

      setError(
        error.response?.data?.detail ||
        "Registration failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-shell flex max-w-6xl justify-center">
      <div className="surface w-full max-w-md p-5 sm:p-8">

        <h1 className="page-title text-center">
          Create Account
        </h1>

        <p className="mt-2 text-center text-gray-600">
          Join MBook
        </p>

        {error && (
          <p role="alert" className="alert-error mt-5">
            {error}
          </p>
        )}

        <form onSubmit={handleRegister} className="mt-6 space-y-4">

          <div>
            <label htmlFor="firstName" className="form-label">
              First Name
            </label>

            <input
              id="firstName"
              type="text"
              required
              maxLength={100}
              autoComplete="given-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="form-field w-full"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="form-label">
              Last Name
            </label>

            <input
              id="lastName"
              type="text"
              required
              maxLength={100}
              autoComplete="family-name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className="form-field w-full"
            />
          </div>

          <div>
            <label htmlFor="email" className="form-label">
              Email
            </label>

            <input
              id="email"
              type="email"
              required
              maxLength={255}
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="form-field w-full"
            />
          </div>

          <div>
            <label htmlFor="password" className="form-label">
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="form-field w-full"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="form-field w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="button button-primary w-full"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-teal-700 hover:underline">
            Login
          </Link>
        </p>

      </div>
    </section>
  );
}
