import { useState } from "react";
import type { Book } from "../api/Book";

interface BookCoverProps {
  book: Pick<Book, "coverImageUrl" | "format" | "title">;
  className: string;
  loading?: "eager" | "lazy";
}

export default function BookCover({ book, className, loading = "lazy" }: BookCoverProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const src = book.coverImageUrl?.trim();
  const background = book.format === "PHYSICAL" ? "bg-[#f3eee5]" : "bg-[#eaf1ec]";

  return (
    <div className={`flex items-center justify-center overflow-hidden ${background} ${className}`}>
      {src && src !== failedUrl ? (
        <img
          src={src}
          alt={`Cover of ${book.title}`}
          className="max-h-full max-w-full rounded-sm object-contain shadow-md"
          loading={loading}
          onError={() => setFailedUrl(src)}
        />
      ) : (
        <div className="flex aspect-[2/3] h-full max-w-full flex-col items-center justify-center gap-3 rounded-l-sm rounded-r-md border border-teal-950/10 border-l-4 border-l-teal-900/50 bg-white/80 px-3 text-center shadow-sm">
          <span aria-hidden="true" className="h-6 w-8 rounded-t-full border border-teal-800/55 border-b-0" />
          <span className="text-xs font-medium leading-snug text-stone-600">Cover unavailable</span>
        </div>
      )}
    </div>
  );
}
