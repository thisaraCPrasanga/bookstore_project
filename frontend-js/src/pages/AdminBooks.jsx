
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
    <section className="page-shell max-w-6xl">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to="/admin"
            className="text-teal-700 hover:underline"
          >
            ← Admin Dashboard
          </Link>

          <h1 className="mt-2 text-2xl font-bold tabular-nums">
            Manage Books
          </h1>

          <p className="mt-2 text-gray-600">
            Add, update, and manage bookstore inventory.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="button button-primary"
        >
          + Add Book
        </button>
      </div>

      {/* Messages */}
      {message && (
        <p
          role="status"
          className="alert-success mt-5"
        >
          {message}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="alert-error mt-5"
        >
          {error}
        </p>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="surface admin-book-form mt-5 p-4 sm:p-6"
        >
          <h2 className="text-xl font-bold">
            {editingBook ? "Edit Book" : "Add New Book"}
          </h2>

          <div className="mt-6 grid gap-5 max-sm:gap-4 max-md:grid-cols-1 max-lg:*:min-w-0 md:grid-cols-2">

            <label className="block">
              <span className="form-label">ISBN *</span>
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
              <span className="form-label">Title *</span>
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
              <span className="form-label">Author *</span>
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
              <span className="form-label">Genre *</span>
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
              <span className="form-label">Format *</span>
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
              <span className="form-label">Price (LKR) *</span>
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
              <span className="form-label">Publisher</span>
              <input
                name="publisher"
                value={form.publisher}
                onChange={updateField}
                maxLength={255}
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="form-label">Published Year</span>
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
                <span className="form-label">Stock *</span>
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
                <span className="form-label">
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
              <span className="form-label">
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
              <span className="form-label">Description</span>
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

          <div className="mt-6 flex flex-wrap gap-3 max-sm:grid max-sm:grid-cols-2">
            <button
              type="submit"
              disabled={saving}
              className="button button-primary"
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
              className="button button-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="surface mt-5 flex flex-wrap gap-2.5 p-3 max-sm:flex-col"
      >
        <input
          type="search"
          value={searchInput}
          onChange={(event) =>
            setSearchInput(event.target.value)
          }
          placeholder="Search books by title..."
          className="form-field grow basis-48 max-sm:basis-auto"
        />

        <button
          type="submit"
          className="button button-primary"
        >
          Search
        </button>
      </form>

      {/* Book List */}
      <div className="surface table-scroll mt-5">
        <table className="admin-table">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-4 py-3">Book</th>
              <th className="px-4 py-3">Format</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Actions</th>
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
                  <td className="px-4 py-3">
                    <p className="font-semibold">
                      {book.title}
                    </p>
                    <p className="text-gray-500">
                      {book.author}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    {book.format}
                  </td>

                  <td className="px-4 py-3">
                    Rs. {Number(book.price).toFixed(2)}
                  </td>

                  <td className="px-4 py-3">
                    {book.format === "PHYSICAL"
                      ? book.stock
                      : "N/A"}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(book)}
                        disabled={book.format === "EBOOK"}
                        className="button button-secondary"
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
                        className="button button-danger"
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
        <div className="pagination">
          <button
            type="button"
            disabled={page === 0 || loading}
            onClick={() => setPage((value) => value - 1)}
            className="button button-secondary"
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
            className="button button-primary"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
