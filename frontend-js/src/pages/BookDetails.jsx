
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import api from "../services/api";

export default function BookDetails() {
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadBook() {
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

  if (loading) {
    return <p className="p-8">Loading book details...</p>;
  }

  if (error) {
    return <p role="alert" className="p-8 text-red-600">{error}</p>;
  }

  if (!book) {
    return <p className="p-8">Book not found.</p>;
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <Link to="/" className="text-teal-700 hover:underline">
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
            <p className="text-gray-500">No Cover Available</p>
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
              <strong>Published Year:</strong> {book.publishedYear}
            </p>
          )}

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
