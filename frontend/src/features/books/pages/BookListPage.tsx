import { useEffect, useRef, useState } from "react";
import catalogHero from "../../../assets/catalog-hero.jpg";
import { getBooks } from "../api/Books-api";
import type { BookPage } from "../api/Books-api";
import { genreLabels } from "../book-display";
import BookCard from "../components/BookCard";

interface CatalogQuery {
  title: string;
  author: string;
  genre: string;
  page: number;
}

type CatalogResult = { query: CatalogQuery } & (
  | { status: "ready"; data: BookPage }
  | { status: "error" }
);

const emptyQuery: CatalogQuery = { title: "", author: "", genre: "", page: 0 };
const filterClass = "mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-base text-stone-900 placeholder:text-stone-500 focus:border-teal-700 focus:outline-2 focus:outline-teal-700";
const buttonClass = "inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-50";

export default function BookListPage() {
  const [query, setQuery] = useState(emptyQuery);
  const [result, setResult] = useState<CatalogResult | null>(null);
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const current = result?.query === query ? result : null;
  const data = current?.status === "ready" ? current.data : null;
  const hasFilters = Boolean(query.title.trim() || query.author.trim() || query.genre);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBooks() {
      try {
        const data = await getBooks(
          query.title.trim() || undefined,
          query.page,
          query.author.trim() || undefined,
          query.genre || undefined,
          controller.signal,
        );
        if (controller.signal.aborted) return;

        // The last page can disappear if the catalog changes between requests.
        if (data.page.totalPages > 0 && query.page >= data.page.totalPages) {
          setQuery((current) => current === query ? { ...query, page: data.page.totalPages - 1 } : current);
          return;
        }
        setResult({ query, status: "ready", data });
      } catch {
        if (!controller.signal.aborted) setResult({ query, status: "error" });
      }
    }

    const timeout = window.setTimeout(() => void loadBooks(), 350);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  function updateFilter(field: "title" | "author" | "genre", value: string) {
    setQuery((current) => ({ ...current, [field]: value, page: 0 }));
  }

  function goToPage(page: number) {
    setQuery((current) => ({ ...current, page }));
    resultsHeading.current?.focus({ preventScroll: true });
    resultsHeading.current?.scrollIntoView({ block: "start" });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-5 pb-12 sm:px-6 sm:pt-7 lg:px-8 lg:pb-16">
      <header className="relative isolate flex flex-col overflow-hidden rounded-2xl bg-[#102824] text-white sm:min-h-80 sm:justify-center lg:min-h-96">
        <img
          src={catalogHero}
          alt=""
          width={1774}
          height={887}
          fetchPriority="high"
          className="aspect-[2.6] h-auto w-full object-cover object-[65%_58%] sm:absolute sm:inset-y-0 sm:right-0 sm:-z-20 sm:aspect-auto sm:h-full sm:w-[72%] sm:object-[center_55%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 hidden bg-linear-to-r from-[#102824] from-30% via-[#102824]/80 via-49% to-transparent to-76% sm:block"
        />
        <div className="order-first px-6 pt-8 pb-6 sm:max-w-[58%] sm:p-10 lg:px-14 lg:py-12">
          <h1 className="font-serif text-4xl leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find your next <span className="block text-teal-100">great read.</span>
          </h1>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-teal-50 sm:text-base">
            Explore printed books and ebooks, from a favorite author to a genre you’ve yet to try.
          </p>
        </div>
      </header>

      <div
        role="search"
        aria-label="Filter books"
        className="mt-6 grid items-end gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto]"
      >
        <label className="text-sm font-semibold text-stone-800">
          Title
          <input
            type="search"
            value={query.title}
            onChange={(event) => updateFilter("title", event.target.value)}
            placeholder="Search by title"
            className={filterClass}
          />
        </label>
        <label className="text-sm font-semibold text-stone-800">
          Author
          <input
            type="search"
            value={query.author}
            onChange={(event) => updateFilter("author", event.target.value)}
            placeholder="Search by author"
            className={filterClass}
          />
        </label>
        <label className="text-sm font-semibold text-stone-800">
          Genre
          <select
            value={query.genre}
            onChange={(event) => updateFilter("genre", event.target.value)}
            className={filterClass}
          >
            <option value="">All genres</option>
            {Object.entries(genreLabels).map(([genre, label]) => (
              <option key={genre} value={genre}>{label}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={!query.title && !query.author && !query.genre}
          onClick={() => setQuery(emptyQuery)}
          className={`${buttonClass} border border-stone-300 text-teal-800 enabled:hover:border-teal-700 enabled:hover:bg-teal-50`}
        >
          Clear filters
        </button>
      </div>

      <section aria-labelledby="catalog-results" className="mt-8 sm:mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <h2
            id="catalog-results"
            tabIndex={-1}
            ref={resultsHeading}
            className="scroll-mt-4 rounded-sm font-serif text-3xl tracking-tight text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
          >
            Browse books
          </h2>
          {data && data.content.length > 0 && (
            <p role="status" className="text-sm tabular-nums text-stone-600">
              Showing {data.page.number * data.page.size + 1}–{data.page.number * data.page.size + data.content.length} of {data.page.totalElements} {data.page.totalElements === 1 ? "book" : "books"}
            </p>
          )}
        </div>

        {!current && (
          <>
            <p role="status" className="mt-4 text-sm text-stone-600">Loading books…</p>
            <div aria-hidden="true" className="mt-4 grid gap-4 min-[440px]:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
                  <div className="h-52 bg-stone-200/65 sm:h-56" />
                  <div className="space-y-3 p-5">
                    <div className="h-4 w-2/3 rounded bg-stone-200" />
                    <div className="h-3 w-1/3 rounded bg-stone-100" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {current?.status === "error" && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-white p-6 sm:p-8">
            <p role="alert" className="font-semibold text-red-900">The catalog couldn’t load.</p>
            <button
              type="button"
              onClick={() => setQuery((current) => ({ ...current }))}
              className={`${buttonClass} mt-4 bg-teal-700 text-white hover:bg-teal-800`}
            >
              Try again
            </button>
          </div>
        )}

        {data && data.content.length === 0 && (
          <div className="mt-5 rounded-2xl border border-stone-200 bg-white px-5 py-10 text-center">
            <div role="status">
              <h3 className="font-serif text-2xl text-stone-950">
                {hasFilters ? "No books match your filters" : "The catalog is empty"}
              </h3>
            </div>
            {hasFilters && (
              <>
                <p className="mt-2 text-sm text-stone-600">Try a different title, author, or genre.</p>
                <button
                  type="button"
                  onClick={() => setQuery(emptyQuery)}
                  className={`${buttonClass} mt-4 border border-stone-300 text-teal-800 hover:bg-teal-50`}
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        )}

        {data && data.content.length > 0 && (
          <ul className="mt-5 grid gap-4 min-[440px]:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {data.content.map((book) => <BookCard key={book.id} book={book} />)}
          </ul>
        )}

        {data && data.page.totalPages > 1 && (
          <nav aria-label="Catalog pages" className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              disabled={data.page.number === 0}
              onClick={() => goToPage(data.page.number - 1)}
              className={`${buttonClass} border border-stone-300 bg-white text-teal-800 enabled:hover:bg-teal-50`}
            >
              Previous
            </button>
            <p className="px-1 text-sm tabular-nums text-stone-600">
              Page {data.page.number + 1} of {data.page.totalPages}
            </p>
            <button
              type="button"
              disabled={data.page.number >= data.page.totalPages - 1}
              onClick={() => goToPage(data.page.number + 1)}
              className={`${buttonClass} min-w-18 bg-teal-700 text-white enabled:hover:bg-teal-800`}
            >
              Next
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}
