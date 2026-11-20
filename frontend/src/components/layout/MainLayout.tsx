import { Link, Outlet } from "react-router";
import NavBar from "./NavBar";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-teal-900 focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <NavBar />

      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-5 text-sm text-stone-600 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} MuchLogic Bookstore</p>
          <Link to="/books" className="inline-flex min-h-9 items-center rounded font-semibold text-teal-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
            Browse books
          </Link>
        </div>
      </footer>
    </div>
  );
}
