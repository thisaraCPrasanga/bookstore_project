import { Link } from "react-router";
import type { Book } from "../api/Book";
import { formatBookPrice } from "../book-display";
import BookAvailability from "./BookAvailability";
import BookCover from "./BookCover";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <li className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <BookCover book={book} className="h-52 px-5 py-6 sm:h-56" />

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <BookAvailability format={book.format} stock={book.stock} />
        <h3 className="mt-3 font-serif text-xl font-semibold leading-tight wrap-anywhere text-stone-950">
          {book.title}
        </h3>
        <p className="mt-1 text-sm wrap-anywhere text-stone-600">{book.author}</p>

        <div className="mt-auto pt-4">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-stone-100 pt-3">
            <p className="font-semibold text-stone-950">{formatBookPrice(book.price)}</p>
            <Link
              to={`/books/${book.id}`}
              aria-label={`View details for ${book.title}`}
              className="inline-flex min-h-10 items-center gap-2 rounded px-1 text-sm font-semibold text-teal-800 hover:text-teal-950 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              View details <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}
