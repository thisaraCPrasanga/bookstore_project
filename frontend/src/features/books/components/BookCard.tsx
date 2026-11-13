import type { Book } from "../api/Book";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <li className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold leading-snug text-gray-700">{book.title}</h2>
      {book.coverImageUrl ? (
  <img
    src={book.coverImageUrl}
    alt={`${book.title} cover`}
    className="mx-auto mb-4 h-48 w-32 rounded object-contain"
  />
) : (
  <div className="mx-auto mb-4 flex h-48 w-32 items-center justify-center rounded bg-gray-100 text-sm text-gray-500">
    No cover available
  </div>
)}
      <p className="text-gray-600 text-sm mt-1">{book.author}</p>
      <p className="mt-2 font-semibold">
  {new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
  }).format(book.price)}
</p>

<p className="mt-2">
  <span className="inline-block rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-900">
    {book.format === "EBOOK" ? "Ebook" : "Printed book"}
  </span>
</p>

{book.format === "PHYSICAL" && (
        <p
    className={`mt-2 text-sm ${
      book.stock !== null && book.stock > 0
        ? "text-green-700"
        : "text-red-600"
    }`}
  >
    {book.stock !== null && book.stock > 0
      ? `In stock: ${book.stock}`
      : "Out of stock"}
  </p>
)}
    </li>
  );
}