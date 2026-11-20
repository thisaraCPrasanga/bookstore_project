
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import api from "../services/api";

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [adding, setAdding] = useState(false);
  const [cartError, setCartError] = useState("");

  // Load book details
  useEffect(() => {
    let cancelled = false;

    async function loadBook() {
      setLoading(true);
      setError("");
      setBook(null);

      try {
        const response = await api.get(`/books/${id}`);

        if (!cancelled) {
          setBook(response.data);
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setError("Failed to load book details.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBook();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Add book to cart
  async function handleAddToCart() {
    if (!book || adding) {
      return;
    }

    setAdding(true);
    setCartError("");

    try {
      // Get CSRF cookie
      await api.get("/auth/csrf");

      // Add one book to the cart
      await api.post("/cart/items", {
        bookId: book.id,
        quantity: 1,
      });

      // Navigate to cart page
      navigate("/cart");

    } catch (error) {
      console.error("Add to cart failed:", error);

      if (error.response?.status === 401) {
        setCartError("Please login before adding books to your cart.");
      } else {
        setCartError(
          error.response?.data?.detail ||
          "Failed to add book to cart."
        );
      }
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return <p className="p-8">Loading book details...</p>;
  }

  if (error) {
    return (
      <p role="alert" className="p-8 text-red-600">
        {error}
      </p>
    );
  }

  if (!book) {
    return <p className="p-8">Book not found.</p>;
  }

  const outOfStock =
    book.format === "PHYSICAL" && book.stock <= 0;

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <Link
        to="/books"
        className="text-teal-700 hover:underline"
      >
        ← Back to Books
      </Link>

      <div className="mt-8 grid gap-10 md:grid-cols-2">

        {/* Book Cover */}
        <div className="flex items-center justify-center rounded-xl bg-gray-100 p-8">
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={book.title}
              className="max-h-96 object-contain"
            />
          ) : (
            <p className="text-gray-500">
              No Cover Available
            </p>
          )}
        </div>

        {/* Book Information */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {book.title}
          </h1>

          <p className="mt-2 text-gray-600">
            By {book.author}
          </p>

          <p className="mt-6 text-2xl font-bold text-teal-700">
            Rs. {Number(book.price).toFixed(2)}
          </p>

          <p className="mt-4">
            <strong>Format:</strong> {book.format}
          </p>

          {book.format === "PHYSICAL" && (
            <p className="mt-2">
              <strong>Stock:</strong>{" "}
              {book.stock > 0 ? book.stock : "Out of Stock"}
            </p>
          )}

          <p className="mt-2">
            <strong>Genre:</strong>{" "}
            {book.genre.replaceAll("_", " ")}
          </p>

          <p className="mt-2">
            <strong>ISBN:</strong> {book.isbn}
          </p>

          {book.publisher && (
            <p className="mt-2">
              <strong>Publisher:</strong> {book.publisher}
            </p>
          )}

          {book.publishedYear != null && (
            <p className="mt-2">
              <strong>Published Year:</strong>{" "}
              {book.publishedYear}
            </p>
          )}

          {/* Add to Cart */}
          <div className="mt-8">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding || outOfStock}
              className="rounded-lg bg-teal-700 px-8 py-3 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {outOfStock
                ? "Out of Stock"
                : adding
                ? "Adding..."
                : "Add to Cart"}
            </button>

            {cartError && (
              <p
                role="alert"
                className="mt-4 text-red-600"
              >
                {cartError}
              </p>
            )}

            {cartError.includes("Please login") && (
              <Link
                to="/login"
                className="mt-3 inline-block text-teal-700 hover:underline"
              >
                Go to Login
              </Link>
            )}
          </div>

          {/* Description */}
          {book.description && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold">
                About This Book
              </h2>

              <p className="mt-3 whitespace-pre-line text-gray-600">
                {book.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
