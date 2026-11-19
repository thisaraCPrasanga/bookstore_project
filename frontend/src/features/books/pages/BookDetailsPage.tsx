import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import type { Book } from "../api/Book";
import { getBookById } from "../api/Books-api";
import { formatBookPrice, genreLabels } from "../book-display";
import BookAvailability from "../components/BookAvailability";
import BookCover from "../components/BookCover";

type BookResult = { requestKey: string } & (
  | { status: "ready"; book: Book }
  | { status: "unavailable" | "error" }
);

const detailGrid = "grid items-start gap-6 md:grid-cols-[minmax(0,4fr)_minmax(0,5fr)] lg:gap-10";
const coverClass = "h-80 rounded-2xl border border-stone-200 px-8 py-8 sm:h-96 lg:h-[28rem] lg:py-10";

export default function BookDetailsPage() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<BookResult | null>(null);
  const requestKey = `${id ?? ""}:${attempt}`;
  const current = result?.requestKey === requestKey ? result : null;
  const unavailable = !id || current?.status === "unavailable";

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    getBookById(id, controller.signal).then(
      (book) => {
        if (!controller.signal.aborted) setResult({ requestKey, status: "ready", book });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        const httpStatus = isAxiosError(error) ? error.response?.status : undefined;
        setResult({ requestKey, status: httpStatus === 404 || httpStatus === 400 ? "unavailable" : "error" });
      },
    );

    return () => controller.abort();
  }, [id, requestKey]);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-5 pb-12 sm:px-6 sm:pt-7 lg:px-8 lg:pb-16">
      <Link
        to="/books"
        className="mb-3 inline-flex min-h-11 items-center gap-2 rounded px-1 text-sm font-semibold text-teal-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
      >
        <span aria-hidden="true">←</span> Back to books
      </Link>

      {id && !current && (
        <>
          <p role="status" className="mb-4 text-sm text-stone-600">Loading book…</p>
          <div className={detailGrid} aria-hidden="true">
            <div className={`${coverClass} bg-stone-200/65`} />
            <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 sm:p-8">
              <div className="h-8 w-3/4 rounded bg-stone-200" />
              <div className="h-4 w-1/3 rounded bg-stone-100" />
              <div className="h-20 rounded bg-stone-100" />
            </div>
          </div>
        </>
      )}

      {(unavailable || current?.status === "error") && (
        <div className="rounded-2xl border border-red-200 bg-white p-6 sm:p-8">
          <div role="alert">
            <h1 className="font-serif text-2xl text-red-900">
              {unavailable ? "This book is unavailable" : "The book details couldn’t load"}
            </h1>
          </div>
          {!unavailable && (
            <button
              type="button"
              onClick={() => setAttempt((current) => current + 1)}
              className="mt-4 min-h-11 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Try again
            </button>
          )}
        </div>
      )}

      {current?.status === "ready" && <BookDetails book={current.book} />}
    </section>
  );
}

function BookDetails({ book }: { book: Book }) {
  return (
    <article className={detailGrid}>
      <BookCover book={book} className={coverClass} loading="eager" />

      <div className="min-w-0 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
        <h1 className="font-serif text-3xl leading-tight tracking-tight wrap-anywhere text-stone-950 sm:text-4xl lg:text-5xl">
          {book.title}
        </h1>
        <p className="mt-3 text-base wrap-anywhere text-stone-600">By {book.author}</p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y border-stone-200 py-4">
          <p className="text-2xl font-semibold tracking-tight text-stone-950">{formatBookPrice(book.price)}</p>
          <BookAvailability format={book.format} stock={book.stock} />
        </div>

        {book.description && (
          <div className="mt-6">
            <h2 className="font-serif text-2xl text-stone-950">About this book</h2>
            <p className="mt-2 leading-relaxed wrap-anywhere whitespace-pre-line text-stone-700">
              {book.description}
            </p>
          </div>
        )}

        <div className="mt-6">
          <h2 className="font-serif text-2xl text-stone-950">Book information</h2>
          <dl className="mt-3 grid gap-x-5 gap-y-4 rounded-xl bg-stone-50 p-4 text-sm sm:grid-cols-2 sm:p-5">
            <div>
              <dt className="text-stone-600">Genre</dt>
              <dd className="mt-1 font-medium text-stone-900">{genreLabels[book.genre]}</dd>
            </div>
            <div>
              <dt className="text-stone-600">ISBN</dt>
              <dd className="mt-1 font-medium wrap-anywhere text-stone-900">{book.isbn}</dd>
            </div>
            {book.publisher && (
              <div>
                <dt className="text-stone-600">Publisher</dt>
                <dd className="mt-1 font-medium wrap-anywhere text-stone-900">{book.publisher}</dd>
              </div>
            )}
            {book.publishedYear !== null && (
              <div>
                <dt className="text-stone-600">Publication year</dt>
                <dd className="mt-1 font-medium text-stone-900">{book.publishedYear}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </article>
  );
}
