import { Link } from "react-router";

export default function NavBar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-bold text-blue-700">
          Bookstore
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/books" className="hover:text-blue-600">
            Books
          </Link>

          <Link to="/login" className="hover:text-blue-600">
            Login
          </Link>
        </div>
      </nav>
    </header>
  );
}