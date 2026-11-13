import { useState, useEffect } from "react"
import type { Book } from "../api/Book"
import { getBooks } from "../api/Books-api";
import BookCard from "../components/BookCard";

export default function BookListPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTitle, setSearchTitle] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadBook() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await getBooks(searchTitle.trim() || undefined);

        if (!ignore) {
          setBooks(data.content);
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
  }, [searchTitle]);
  
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
    onChange={(event) => setSearchTitle(event.target.value)}
    placeholder="Enter a book title"
    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-2"
        />
        {searchTitle && (
  <button
    type="button"
    onClick={() => setSearchTitle("")}
    className="mt-2 rounded-lg bg-gray-200 px-4 py-2"
  >
    Clear search
  </button>
)}
</div>

      
      {isLoading && <p className="mt-4">Loading books....</p>}

      {errorMessage && (
        <p role="alert" className="mt-4 text-red-600">
          {errorMessage}
        </p>
      )}

      {!isLoading && !errorMessage && books.length === 0 && (
        <p className="mt-4 text-gray-600">
          {searchTitle.trim()
  ? `No books found for "${searchTitle.trim()}".`
  : "No books available."}
        </p>
      )}

      {!isLoading && !errorMessage && (
  <>
    <p className="mt-4">
      Loaded books: {books.length}
    </p>

    <ul className="mt-6space-y-3 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((book) => (
        <BookCard key={book.id} book={book}/>
      ))}
    </ul>
  </>
)}
      
    </section>
  )
}