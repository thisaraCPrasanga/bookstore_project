import type { Book } from "../api/Book";

export default function BookAvailability({ format, stock }: Pick<Book, "format" | "stock">) {
  const inStock = stock !== null && stock > 0;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium">
      <span className="rounded-full bg-teal-50 px-2.5 py-1 text-teal-800">
        {format === "EBOOK" ? "Ebook" : "Printed book"}
      </span>
      {format === "PHYSICAL" && (
        <span className={inStock ? "text-emerald-800" : "text-red-800"}>
          {inStock ? `${stock} in stock` : "Out of stock"}
        </span>
      )}
    </div>
  );
}
