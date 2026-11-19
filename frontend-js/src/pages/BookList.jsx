
import { useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../services/api";

export default function BookList() {
  const [books, setBooks] = useState([]);

  const [titleInput, setTitleInput] = useState("");
  const [authorInput, setAuthorInput] = useState("");
  const [genreInput, setGenreInput] = useState("");

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadBooks() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/books", {
          params: {
            title,
            author,
            genre,
            page,
            size: 6,
          },
        });

        if (!cancelled) {
          setBooks(response.data.content);
          setTotalPages(response.data.page.totalPages);
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setError("Failed to load books.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBooks();

    return () => {
      cancelled = true;
    };
  }, [title, author, genre, page]);

  function handleSearch(event) {
    event.preventDefault();

    setPage(0);
    setTitle(titleInput.trim());
    setAuthor(authorInput.trim());
    setGenre(genreInput);
  }

  function clearFilters() {
    setTitleInput("");
    setAuthorInput("");
    setGenreInput("");

    setTitle("");
    setAuthor("");
    setGenre("");
    setPage(0);
  }

  return (
    <div>
      {/* Search and Filters */}
      <form
        onSubmit={handleSearch}
        className="mt-6 grid gap-4 rounded-xl border border-gray-200 bg-white p-5 md:grid-cols-3"
      >
        <div>
          <label
            htmlFor="title"
            className="mb-2 block font-medium"
          >
            Book Title
          </label>

          <input
            id="title"
            type="search"
            value={titleInput}
            onChange={(event) => setTitleInput(event.target.value)}
            placeholder="Search by title"
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
        </div>

        <div>
          <label
            htmlFor="author"
            className="mb-2 block font-medium"
          >
            Author
          </label>

          <input
            id="author"
            type="search"
            value={authorInput}
            onChange={(event) => setAuthorInput(event.target.value)}
            placeholder="Search by author"
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
        </div>

        <div>
          <label
            htmlFor="genre"
            className="mb-2 block font-medium"
          >
            Genre
          </label>

          <select
            id="genre"
            value={genreInput}
            onChange={(event) => setGenreInput(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
          >
            <option value="">All Genres</option>
            <option value="FICTION">Fiction</option>
            <option value="CHILDREN">Children</option>
            <option value="EDUCATION">Education</option>
            <option value="SCIENCE">Science</option>
            <option value="PROGRAMMING">Programming</option>
            <option value="BUSINESS">Business</option>
            <option value="HISTORY">History</option>
            <option value="BIOGRAPHY">Biography</option>
            <option value="SELF_HELP">Self Help</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="flex gap-3 md:col-span-3">
          <button
            type="submit"
            className="rounded-lg bg-teal-700 px-6 py-3 font-medium text-white hover:bg-teal-800"
          >
            Search Books
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-gray-300 px-6 py-3 hover:bg-gray-100"
          >
            Clear Filters
          </button>
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <p className="mt-6 text-gray-600">
          Loading books...
        </p>
      )}

      {/* Error */}
      {error && (
        <p role="alert" className="mt-6 text-red-600">
          {error}
        </p>
      )}

      {/* Empty Results */}
      {!loading && !error && books.length === 0 && (
        <p className="mt-6 text-gray-600">
          No books found.
        </p>
      )}

      {/* Book Cards */}
      {!loading && !error && (
        <>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <div
                key={book.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                {book.coverImageUrl ? (
                  <img
                    src={book.coverImageUrl}
                    alt={book.title}
                    className="mx-auto h-48 w-32 object-contain"
                  />
                ) : (
                  <div className="mx-auto flex h-48 w-32 items-center justify-center rounded bg-gray-100 text-sm text-gray-500">
                    No Cover
                  </div>
                )}

                <h3 className="mt-4 text-lg font-bold">
                  {book.title}
                </h3>

                <p className="mt-1 text-gray-600">
                  {book.author}
                </p>

                <p className="mt-3 font-semibold text-teal-700">
                  Rs. {Number(book.price).toFixed(2)}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  {book.format === "EBOOK"
                    ? "Ebook"
                    : "Printed Book"}
                </p>

                {book.format === "PHYSICAL" && (
                  <p className="mt-2 text-sm">
                    {book.stock > 0
                      ? "In Stock"
                      : "Out of Stock"}
                  </p>
                )}

                <Link
                  to={`/books/${book.id}`}
                  className="mt-5 inline-block rounded-lg bg-teal-700 px-5 py-2 text-white hover:bg-teal-800"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={page === 0 || loading}
                onClick={() => setPage(page - 1)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-gray-700">
                Page {page + 1} of {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages - 1 || loading}
                onClick={() => setPage(page + 1)}
                className="rounded-lg bg-teal-700 px-4 py-2 text-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
