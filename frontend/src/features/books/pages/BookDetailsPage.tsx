import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import type { Book } from "../api/Book";
import { getBookById } from "../api/Books-api";

export default function BookDetailsPage() {
  const { id } = useParams();

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadBook() {
      setIsLoading(true);
      setErrorMessage(null);
      setBook(null);

      if (!id) {
        setErrorMessage("Book ID is missing.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await getBookById(id);

        if (!ignore) {
          setBook(data);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Failed to load book", error);
          setErrorMessage("Unable to load this book.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadBook();

    return () => {
      ignore = true;
    };
  }, [id]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
  to="/books"
  className="mb-6 inline-block text-sm font-medium text-teal-700 hover:underline"
>
  ← Back to books
</Link>
      {isLoading && <p>Loading book...</p>}

      {errorMessage && (
        <p role="alert" className="text-red-600">
          {errorMessage}
        </p>
      )}

      {!isLoading && !errorMessage && book && (
        <>
          {book.coverImageUrl ? (
  <img
    src={book.coverImageUrl}
    alt={`${book.title} cover`}
    className="mb-6 h-72 w-48 rounded-lg object-contain"
  />
) : (
  <div className="mb-6 flex h-72 w-48 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
    No cover available
  </div>
)}
          <h1 className="text-3xl font-bold text-gray-900">
            {book.title}
          </h1>
          <p className="mt-2 text-gray-600">By {book.author}</p>

          <p className="mt-4 text-2xl font-bold text-gray-900">
  {new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
  }).format(book.price)}
</p>

<p className="mt-3">
  <span className="inline-block rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">
    {book.format === "EBOOK" ? "Ebook" : "Printed book"}
  </span>
          </p>
          
          {book.format === "PHYSICAL" && (
  <p
    className={`mt-3 text-sm font-medium ${
      book.stock !== null && book.stock > 0
        ? "text-green-700"
        : "text-red-600"
    }`}
  >
    {book.stock !== null && book.stock > 0
      ? `In stock: ${book.stock}`
      : "Out of stock"}
  </p>
          )}
          
          {book.description && (
  <div className="mt-6">
    <h2 className="text-lg font-semibold text-gray-900">
      About this book
    </h2>

    <p className="mt-2 whitespace-pre-line leading-relaxed text-gray-600">
      {book.description}
    </p>
  </div>
          )}
          
          <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
  <div>
    <dt className="text-gray-500">Genre</dt>
    <dd className="mt-1 font-medium">
      {book.genre.replaceAll("_", " ")}
    </dd>
  </div>

  {book.publisher && (
    <div>
      <dt className="text-gray-500">Publisher</dt>
      <dd className="mt-1 font-medium">{book.publisher}</dd>
    </div>
  )}

  {book.publishedYear !== null && (
    <div>
      <dt className="text-gray-500">Published year</dt>
      <dd className="mt-1 font-medium">{book.publishedYear}</dd>
    </div>
  )}

  <div>
    <dt className="text-gray-500">ISBN</dt>
    <dd className="mt-1 break-all font-medium">{book.isbn}</dd>
  </div>
</dl>

        </>
      )}
    </section>
  );
}