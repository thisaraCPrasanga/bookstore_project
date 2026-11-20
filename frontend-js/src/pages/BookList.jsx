
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
            size: 16,
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
        className="surface mt-3 grid min-w-0 items-end gap-3 p-3 max-sm:grid-cols-1 sm:grid-cols-3 sm:p-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto]"
      >
        <div>
          <label
            htmlFor="title"
            className="form-label"
          >
            Book Title
          </label>

          <input
            id="title"
            type="search"
            value={titleInput}
            onChange={(event) => setTitleInput(event.target.value)}
            placeholder="Search by title"
            className="form-field w-full bg-gray-50"
          />
        </div>

        <div>
          <label
            htmlFor="author"
            className="form-label"
          >
            Author
          </label>

          <input
            id="author"
            type="search"
            value={authorInput}
            onChange={(event) => setAuthorInput(event.target.value)}
            placeholder="Search by author"
            className="form-field w-full bg-gray-50"
          />
        </div>

        <div>
          <label
            htmlFor="genre"
            className="form-label"
          >
            Genre
          </label>

          <select
            id="genre"
            value={genreInput}
            onChange={(event) => setGenreInput(event.target.value)}
            className="form-field w-full bg-gray-50"
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

        <div className="flex flex-wrap gap-2 max-sm:grid max-sm:grid-cols-2 max-sm:*:px-2 sm:col-span-3 lg:col-span-1">
          <button
            type="submit"
            className="button button-primary"
          >
            Search Books
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="button button-secondary"
          >
            Clear Filters
          </button>
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <p className="surface mt-4 px-4 py-5 text-sm text-gray-600">
          Loading books...
        </p>
      )}

      {/* Error */}
      {error && (
        <p role="alert" className="alert-error mt-4">
          {error}
        </p>
      )}

      {/* Empty Results */}
      {!loading && !error && books.length === 0 && (
        <p className="surface mt-4 px-4 py-5 text-sm text-gray-600">
          No books found.
        </p>
      )}

      {/* Book Cards */}
      {!loading && !error && (
        <>
          <div className="mt-5 grid grid-cols-1 gap-4 empty:hidden sm:grid-cols-2 lg:grid-cols-4">
            {books.map((book) => (
              <div
                key={book.id}
                className="surface flex min-w-0 flex-col p-3.5"
              >
                <div className="book-cover">
                  {book.coverImageUrl && (
                    <img src={book.coverImageUrl} alt="" />
                  )}
                </div>

                <h3 className="mt-3 text-base leading-snug font-semibold wrap-anywhere">
                  {book.title}
                </h3>

                <p className="mt-1 text-sm wrap-anywhere text-gray-600">
                  {book.author}
                </p>

                <p className="mt-3 font-bold text-teal-800">
                  Rs. {Number(book.price).toFixed(2)}
                </p>

                <p className="mt-1.5 text-xs text-gray-600 last-of-type:mb-3">
                  {book.format === "EBOOK"
                    ? "Ebook"
                    : "Printed Book"}
                </p>

                {book.format === "PHYSICAL" && (
                  <p className="mt-1 text-xs text-gray-600 last-of-type:mb-3">
                    {book.stock > 0
                      ? "In Stock"
                      : "Out of Stock"}
                  </p>
                )}

                <Link
                  to={`/books/${book.id}`}
                  className="button button-primary mt-auto w-full rounded-full"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                disabled={page === 0 || loading}
                onClick={() => setPage(page - 1)}
                className="button button-secondary"
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
                className="button button-primary"
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
