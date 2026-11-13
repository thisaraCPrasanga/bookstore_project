
import { BrowserRouter, Routes, Route } from "react-router";

import BookListPage from "../features/books/pages/BookListPage";
import LoginPage from "../features/auth/pages/LoginPage";
import MainLayout from '../components/layout/MainLayout'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
        <Route path="/" element={<BookListPage />} />
        <Route path="/books" element={<BookListPage />} />
        <Route path="/login" element={<LoginPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
