
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
      // Get CSRF cookie before login
      await api.get("/auth/csrf");

      // Send login credentials to Spring Boot
      const response = await api.post("/users/login", {
        email,
        password,
      });

      console.log("Login successful:", response.data.email);

      // Go to home page
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);

      setError("Invalid credentials or login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-[70vh] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">

        <h1 className="text-center text-3xl font-bold text-gray-900">
          Welcome Back
        </h1>

        <p className="mt-2 text-center text-gray-600">
          Sign in to MuchLogic Bookstore
        </p>

        {error && (
          <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="mt-8 space-y-5">

          <div>
            <label htmlFor="email" className="mb-2 block font-medium">
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
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block font-medium">
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
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

        </form>
      </div>
    </section>
  );
}

