import { useState, useEffect } from "react"
import type { Book } from "../api/Book"
import { getBooks } from "../api/Books-api";
import BookCard from "../components/BookCard";

export default function BookListPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTitle, setSearchTitle] = useState("");
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchAuthor, setSearchAuthor] = useState("");
  const [searchGenre, setSearchGenre] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadBook() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await getBooks(searchTitle.trim() || undefined, page, searchAuthor.trim()||undefined, searchGenre || undefined);

        if (!ignore) {
          setBooks(data.content);
          setTotalElements(data.page.totalElements);
          setTotalPages(data.page.totalPages)
        }
      }
      catch (error) {
        if (!ignore) {
          console.error("failed to load books ", error);
          setErrorMessage("Unable to load books. Please try again later.")
        }
      }
      finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    const timeoutId = setTimeout(() => {
      loadBook();
    }, 400);

    return () => {
      ignore = true;
      clearTimeout(timeoutId);
    };
  }, [searchTitle, page, searchAuthor, searchGenre]);
  
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 ">
       <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
  Find your next great read
</h1>

<p className="mt-2 text-gray-600">
  Printed books and ebooks, all in one place.
</p>

      <div className="mt-6">
  <label
    htmlFor="search-title"
    className="mb-2 block text-sm font-medium"
  >
    Search by title
  </label>

  <input
    id="search-title"
    type="search"
    value={searchTitle}
          onChange={(event) => { setSearchTitle(event.target.value); setPage(0) }}
    placeholder="Enter a book title"
    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-2"
        />
        {(searchTitle || searchAuthor || searchGenre) && (
  <button
    type="button"
            onClick={() => { setSearchTitle(""); setSearchAuthor(""); setPage(0); setSearchGenre("")}}
    className="mt-2 rounded-lg bg-gray-200 px-4 py-2"
  >
    Clear search
  </button>
)}
      </div>
      
      <div className="mt-4">
  <label
    htmlFor="search-author"
    className="mb-2 block text-sm font-medium"
  >
    Search by author
  </label>

  <input
    id="search-author"
    type="search"
    value={searchAuthor}
    onChange={(event) => {
      setSearchAuthor(event.target.value);
      setPage(0);
    }}
    placeholder="Enter an author name"
    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
  />
      </div>
      
      <div className="mt-4">
  <label
    htmlFor="search-genre"
    className="mb-2 block text-sm font-medium"
  >
    Genre
  </label>

  <select
    id="search-genre"
    value={searchGenre}
    onChange={(event) => {
      setSearchGenre(event.target.value);
      setPage(0);
    }}
    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
  >
    <option value="">All genres</option>
    <option value="FICTION">Fiction</option>
    <option value="CHILDREN">Children</option>
    <option value="EDUCATION">Education</option>
    <option value="SCIENCE">Science</option>
    <option value="PROGRAMMING">Programming</option>
    <option value="BUSINESS">Business</option>
    <option value="HISTORY">History</option>
    <option value="BIOGRAPHY">Biography</option>
    <option value="SELF_HELP">Self-help</option>
    <option value="OTHER">Other</option>
  </select>
</div>

      
      {isLoading && <p className="mt-4">Loading books....</p>}

      {errorMessage && (
        <p role="alert" className="mt-4 text-red-600">
          {errorMessage}
        </p>
      )}

      {!isLoading && !errorMessage && books.length === 0 && (
        <p className="mt-4 text-gray-600">
          {searchTitle.trim()||searchAuthor.trim()||searchGenre
  ? `No books mach your filter.`
  : "No books available."}
        </p>
      )}

      {!isLoading && !errorMessage && (
  <>
    <p className="mt-4">
      Loaded books: {totalElements}
          </p>
          {totalPages > 0 && (
  <p className="mt-1 text-sm text-gray-600">
    Page {page + 1} of {totalPages}
  </p>
)}

    <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((book) => (
        <BookCard key={book.id} book={book}/>
      ))}
          </ul>

          
          {totalPages > 1 && (
  <div className="mt-6 flex justify-center gap-3">
    <button
      type="button"
      disabled={page === 0}
      onClick={() => setPage((current) => current - 1)}
      className="rounded-lg border border-gray-300 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Previous
    </button>

    <button
      type="button"
      disabled={page >= totalPages - 1}
      onClick={() => setPage((current) => current + 1)}
      className="rounded-lg bg-teal-700 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      Next
    </button>
  </div>
)}
  </>
)}
      
    </section>
  )
}