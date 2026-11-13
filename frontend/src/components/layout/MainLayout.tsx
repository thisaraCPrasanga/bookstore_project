import { Outlet } from "react-router";
import NavBar from "./NavBar";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <NavBar />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-white py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Bookstore. All rights reserved.
      </footer>
    </div>
  );
}