
import { useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../services/api";

export default function MyEbooks() {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loginRequired, setLoginRequired] = useState(false);

  // Load purchased ebook downloads
  useEffect(() => {
    let cancelled = false;

    async function loadEbooks() {
      try {
        const response = await api.get("/downloads/my");

        if (!cancelled) {
  const currentTime = Date.now();

  const updatedEbooks = response.data.map((ebook) => ({
    ...ebook,
    expired:
      new Date(ebook.expiresAt).getTime() <= currentTime,
  }));

  setEbooks(updatedEbooks);
}
      } catch (error) {
        console.error("Failed to load ebooks:", error);

        if (!cancelled) {
          if (error.response?.status === 401) {
            setLoginRequired(true);
          } else if (error.response?.status === 403) {
            setError("Only customers can access ebook downloads.");
          } else {
            setError("Failed to load your ebooks.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadEbooks();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="p-8">Loading your ebooks...</p>;
  }

  if (loginRequired) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold">My Ebooks</h1>

        <p className="mt-6">
          Please login to access your ebooks.
        </p>

        <Link
          to="/login"
          className="mt-5 inline-block rounded-lg bg-teal-700 px-6 py-3 text-white"
        >
          Login
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900">
        My Ebooks
      </h1>

      <p className="mt-2 text-gray-600">
        Download your purchased ebooks.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-lg bg-red-50 p-4 text-red-700"
        >
          {error}
        </p>
      )}

      {!error && ebooks.length === 0 && (
        <div className="mt-8 rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-gray-600">
            No ebook downloads available yet.
          </p>

          <p className="mt-3 text-sm text-gray-500">
            Your ebooks will appear here after
            payment is confirmed and the download
            is made available.
          </p>

          <Link
            to="/books"
            className="mt-6 inline-block rounded-lg bg-teal-700 px-6 py-3 text-white"
          >
            Browse Books
          </Link>
        </div>
      )}

      {!error && ebooks.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {ebooks.map((ebook) => {
  const expired = ebook.expired;

            const canDownload =
              !expired && ebook.downloadsLeft > 0;

            return (
              <div
                key={ebook.token}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold text-gray-900">
                  {ebook.bookTitle}
                </h2>

                <p className="mt-4 text-sm text-gray-600">
                  <strong>Expires:</strong>{" "}
                  {new Date(ebook.expiresAt).toLocaleString("en-LK")}
                </p>

                <p className="mt-3 text-sm text-gray-600">
                  <strong>Downloads Left:</strong>{" "}
                  {ebook.downloadsLeft}
                </p>

                {expired && (
                  <p className="mt-4 text-sm font-medium text-red-600">
                    This download link has expired.
                  </p>
                )}

                {!expired && ebook.downloadsLeft === 0 && (
                  <p className="mt-4 text-sm font-medium text-red-600">
                    Download limit reached.
                  </p>
                )}

                {canDownload ? (
                  <a
                    href={`/api/v1/downloads/${ebook.token}`}
                    className="mt-6 inline-block rounded-lg bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800"
                  >
                    Download Ebook
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-6 rounded-lg bg-gray-400 px-6 py-3 font-semibold text-white"
                  >
                    Download Unavailable
                  </button>
                )}

                <Link
                  to={`/books/${ebook.bookId}`}
                  className="mt-5 block text-sm text-teal-700 hover:underline"
                >
                  View Book Details
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-8 text-sm text-gray-500">
        Refresh this page after downloading to see
        your updated remaining download count.
      </p>
    </section>
  );
}
