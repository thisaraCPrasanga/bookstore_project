
import { BrowserRouter, Link, Route, Routes } from "react-router";
import MainLayout from "../components/layout/MainLayout";
import { AuthProvider } from "../features/auth/context/authProvider";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import { GuestRoute, RequireCustomer } from "../features/auth/routes/AuthRoutes";
import BookDetailsPage from "../features/books/pages/BookDetailsPage";
import BookListPage from "../features/books/pages/BookListPage";

function CustomerSection({ title }: { title: string }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-gray-600">This section is coming soon.</p>
      <Link to="/books" className="mt-4 inline-block font-medium text-teal-700 underline">
        Browse books
      </Link>
    </section>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<BookListPage />} />
            <Route path="/books" element={<BookListPage />} />
            <Route path="/books/:id" element={<BookDetailsPage />} />

            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<RequireCustomer />}>
              <Route path="/cart" element={<CustomerSection title="Cart" />} />
              <Route path="/orders" element={<CustomerSection title="My Orders" />} />
              <Route path="/downloads" element={<CustomerSection title="Downloads" />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
