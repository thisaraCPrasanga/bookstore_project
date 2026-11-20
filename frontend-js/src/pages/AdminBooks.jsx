
import { useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../services/api";

const GENRES = [
  "FICTION",
  "CHILDREN",
  "EDUCATION",
  "SCIENCE",
  "PROGRAMMING",
  "BUSINESS",
  "HISTORY",
  "BIOGRAPHY",
  "SELF_HELP",
  "OTHER",
];

const emptyForm = {
  isbn: "",
  title: "",
  author: "",
  genre: "FICTION",
  publisher: "",
  publishedYear: "",
  description: "",
  coverImageUrl: "",
  format: "PHYSICAL",
  price: "",
  stock: "0",
  fileKey: "",
};

const inputClass =
  "w-full rounded-lg border border-gray-300 px-4 py-2";

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [searchTitle, setSearchTitle] = useState("");

  const [refreshCount, setRefreshCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hidingId, setHidingId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Load books
  useEffect(() => {
    let cancelled = false;

    async function loadBooks() {
      setLoading(true);

      try {
        const response = await api.get("/books", {
          params: {
            title: searchTitle,
            page,
            size: 10,
            sort: "title,asc",
          },
        });

        if (!cancelled) {
          setBooks(response.data.content ?? []);
          setTotalPages(response.data.page?.totalPages ?? 0);
        }
      } catch (err) {
        console.error(err);

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
  }, [page, searchTitle, refreshCount]);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSearch(event) {
    event.preventDefault();

    setError("");
    setPage(0);
    setSearchTitle(searchInput.trim());
  }

  // Open Add Book form
  function handleAdd() {
    setForm({ ...emptyForm });
    setEditingBook(null);
    setShowForm(true);
    setError("");
    setMessage("");
  }

  // Open Edit Book form
  async function handleEdit(book) {
    setError("");
    setMessage("");

    if (book.format === "EBOOK") {
      setError(
        "Ebook editing is not available yet. The API must return its existing file key safely."
      );
      return;
    }

    try {
      // Get latest book version before editing
      const response = await api.get(`/books/${book.id}`);
      const selectedBook = response.data;

      setEditingBook(selectedBook);

      setForm({
        isbn: selectedBook.isbn,
        title: selectedBook.title,
        author: selectedBook.author,
        genre: selectedBook.genre,
        publisher: selectedBook.publisher ?? "",
        publishedYear: selectedBook.publishedYear ?? "",
        description: selectedBook.description ?? "",
        coverImageUrl: selectedBook.coverImageUrl ?? "",
        format: selectedBook.format,
        price: String(selectedBook.price),
        stock: String(selectedBook.stock ?? 0),
        fileKey: "",
      });

      setShowForm(true);
    } catch (err) {
      console.error(err);
      setError("Failed to load book details.");
    }
  }

  // Create or Update Book
  async function handleSave(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      isbn: form.isbn.trim(),
      title: form.title.trim(),
      author: form.author.trim(),
      genre: form.genre,
      publisher: form.publisher.trim() || null,
      publishedYear: form.publishedYear
        ? Number(form.publishedYear)
        : null,
      description: form.description.trim() || null,
      coverImageUrl: form.coverImageUrl.trim() || null,
      price: Number(form.price).toFixed(2),
      stock:
        form.format === "PHYSICAL"
          ? Number(form.stock)
          : null,
      fileKey:
        form.format === "EBOOK"
          ? form.fileKey.trim() || null
          : null,
    };

    try {
      await api.get("/auth/csrf");

      if (editingBook) {
        await api.put(`/books/${editingBook.id}`, {
          ...payload,
          version: editingBook.version,
        });

        setMessage("Book updated successfully.");
      } else {
        await api.post("/books", {
          ...payload,
          format: form.format,
        });

        setMessage("Book created successfully.");
      }

      setShowForm(false);
      setEditingBook(null);
      setPage(0);
      setRefreshCount((count) => count + 1);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 403) {
        setError("You do not have admin permission.");
      } else if (err.response?.status === 409) {
        setError(
          err.response.data?.detail ||
          "Book conflict. Reload and try again."
        );
      } else {
        setError(
          err.response?.data?.detail ||
          "Failed to save book."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  // Hide Book
  async function handleHide(book) {
    const confirmed = window.confirm(
      `Hide "${book.title}" from the bookstore?`
    );

    if (!confirmed) return;

    setHidingId(book.id);
    setError("");
    setMessage("");

    try {
      await api.get("/auth/csrf");
      await api.delete(`/books/${book.id}`);

      setMessage("Book hidden successfully.");

      if (books.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        setRefreshCount((count) => count + 1);
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Failed to hide book."
      );
    } finally {
      setHidingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to="/admin"
            className="text-teal-700 hover:underline"
          >
            ← Admin Dashboard
          </Link>

          <h1 className="mt-3 text-3xl font-bold">
            Manage Books
          </h1>

          <p className="mt-2 text-gray-600">
            Add, update, and manage bookstore inventory.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
        >
          + Add Book
        </button>
      </div>

      {/* Messages */}
      {message && (
        <p
          role="status"
          className="mt-6 rounded-lg bg-green-50 p-4 text-green-700"
        >
          {message}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-lg bg-red-50 p-4 text-red-700"
        >
          {error}
        </p>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold">
            {editingBook ? "Edit Book" : "Add New Book"}
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            <label className="block">
              <span className="mb-2 block">ISBN *</span>
              <input
                name="isbn"
                value={form.isbn}
                onChange={updateField}
                required
                maxLength={20}
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-2 block">Title *</span>
              <input
                name="title"
                value={form.title}
                onChange={updateField}
                required
                maxLength={255}
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-2 block">Author *</span>
              <input
                name="author"
                value={form.author}
                onChange={updateField}
                required
                maxLength={255}
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-2 block">Genre *</span>
              <select
                name="genre"
                value={form.genre}
                onChange={updateField}
                className={inputClass}
              >
                {GENRES.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block">Format *</span>
              <select
                name="format"
                value={form.format}
                onChange={(event) => {
                  setForm((previous) => ({
                    ...previous,
                    format: event.target.value,
                    stock:
                      event.target.value === "PHYSICAL"
                        ? "0"
                        : "",
                    fileKey: "",
                  }));
                }}
                disabled={Boolean(editingBook)}
                className={inputClass}
              >
                <option value="PHYSICAL">Printed Book</option>
                <option value="EBOOK">Ebook</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block">Price (LKR) *</span>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={updateField}
                required
                min="0"
                step="0.01"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-2 block">Publisher</span>
              <input
                name="publisher"
                value={form.publisher}
                onChange={updateField}
                maxLength={255}
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-2 block">Published Year</span>
              <input
                type="number"
                name="publishedYear"
                value={form.publishedYear}
                onChange={updateField}
                min="1"
                max="2100"
                step="1"
                className={inputClass}
              />
            </label>

            {form.format === "PHYSICAL" ? (
              <label className="block">
                <span className="mb-2 block">Stock *</span>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={updateField}
                  required
                  min="0"
                  step="1"
                  className={inputClass}
                />
              </label>
            ) : (
              <label className="block">
                <span className="mb-2 block">
                  Ebook File Key
                </span>
                <input
                  name="fileKey"
                  value={form.fileKey}
                  onChange={updateField}
                  maxLength={255}
                  placeholder="example-book.pdf"
                  className={inputClass}
                />
                <span className="mt-1 block text-xs text-gray-500">
                  Existing server file name, not a file upload.
                </span>
              </label>
            )}

            <label className="block md:col-span-2">
              <span className="mb-2 block">
                Cover Image HTTPS URL
              </span>
              <input
                type="url"
                name="coverImageUrl"
                value={form.coverImageUrl}
                onChange={updateField}
                maxLength={500}
                placeholder="https://example.com/cover.jpg"
                className={inputClass}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block">Description</span>
              <textarea
                name="description"
                value={form.description}
                onChange={updateField}
                maxLength={5000}
                rows={4}
                className={inputClass}
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingBook
                ? "Update Book"
                : "Create Book"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingBook(null);
              }}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-6 py-3 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="mt-8 flex flex-wrap gap-3"
      >
        <input
          type="search"
          value={searchInput}
          onChange={(event) =>
            setSearchInput(event.target.value)
          }
          placeholder="Search books by title..."
          className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3"
        />

        <button
          type="submit"
          className="rounded-lg bg-teal-700 px-6 py-3 text-white hover:bg-teal-800"
        >
          Search
        </button>
      </form>

      {/* Book List */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Book</th>
              <th className="p-4">Format</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center">
                  Loading books...
                </td>
              </tr>
            ) : books.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center">
                  No books found.
                </td>
              </tr>
            ) : (
              books.map((book) => (
                <tr
                  key={book.id}
                  className="border-t border-gray-200"
                >
                  <td className="p-4">
                    <p className="font-semibold">
                      {book.title}
                    </p>
                    <p className="text-gray-500">
                      {book.author}
                    </p>
                  </td>

                  <td className="p-4">
                    {book.format}
                  </td>

                  <td className="p-4">
                    Rs. {Number(book.price).toFixed(2)}
                  </td>

                  <td className="p-4">
                    {book.format === "PHYSICAL"
                      ? book.stock
                      : "N/A"}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(book)}
                        disabled={book.format === "EBOOK"}
                        className="font-medium text-teal-700 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                        title={
                          book.format === "EBOOK"
                            ? "Ebook editing needs backend file-key support"
                            : "Edit book"
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleHide(book)}
                        disabled={hidingId !== null}
                        className="font-medium text-red-600 hover:underline disabled:opacity-40"
                      >
                        {hidingId === book.id
                          ? "Hiding..."
                          : "Hide"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page === 0 || loading}
            onClick={() => setPage((value) => value - 1)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 disabled:opacity-40"
          >
            Previous
          </button>

          <span>
            Page {page + 1} of {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => setPage((value) => value + 1)}
            className="rounded-lg bg-teal-700 px-4 py-2 text-white disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
