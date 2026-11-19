
import { BrowserRouter, Routes, Route, Link } from "react-router";

import BookList from "./pages/BookList";
import BookDetails from "./pages/BookDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";

function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-teal-700 px-6 py-20 text-center text-white">
        <h1 className="text-4xl font-bold">
          Discover Your Next Favorite Book
        </h1>

        <p className="mt-4 text-lg text-teal-100">
          Explore our collection of printed books and ebooks.
        </p>

        <a
          href="#books"
          className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-teal-800 hover:bg-gray-100"
        >
          Browse Books
        </a>
      </section>

      {/* Book Catalog */}
      <section id="books" className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-2xl font-bold">
          Our Books
        </h2>

        <BookList />
      </section>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-gray-50">

        {/* Navbar */}
        <header className="border-b border-gray-200 bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

            <Link to="/" className="text-2xl font-bold text-teal-700">
              MuchLogic Bookstore
            </Link>

            <div className="flex gap-6">
              <Link
                to="/books"
                className="text-gray-700 hover:text-teal-700"
              >
                Books
              </Link>

              <Link
                to="/login"
                className="text-gray-700 hover:text-teal-700"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="text-gray-700 hover:text-teal-700"
              >
                Register
              </Link>
            </div>

          </nav>
        </header>

        {/* Pages */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/books" element={<HomePage />} />
            <Route path="/books/:id" element={<BookDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white py-6 text-center text-gray-500">
          <p>© 2026 MuchLogic Bookstore. All rights reserved.</p>
        </footer>

      </div>
    </BrowserRouter>
  );
}
