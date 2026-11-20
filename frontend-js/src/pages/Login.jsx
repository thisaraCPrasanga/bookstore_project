
import { useState } from "react";
import { useNavigate } from "react-router";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      await api.get("/auth/csrf");

      const response = await api.post("/users/login", {
        email,
        password,
      });

      console.log("Login successful:", response.data.email);

      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);

      setError("Invalid credentials or login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-shell flex max-w-6xl justify-center">
      <div className="surface w-full max-w-md p-5 sm:p-8">

        <h1 className="page-title text-center">
          Welcome Back
        </h1>

        <p className="mt-2 text-center text-gray-600">
          Sign in to MBook
        </p>

        {error && (
          <p role="alert" className="alert-error mt-5">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">

          <div>
            <label htmlFor="email" className="form-label">
              Email
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
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
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="form-field w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="button button-primary w-full"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

        </form>
      </div>
    </section>
  );
}

