import type { Book } from "./api/Book";

export const genreLabels: Record<Book["genre"], string> = {
  FICTION: "Fiction",
  CHILDREN: "Children",
  EDUCATION: "Education",
  SCIENCE: "Science",
  PROGRAMMING: "Programming",
  BUSINESS: "Business",
  HISTORY: "History",
  BIOGRAPHY: "Biography",
  SELF_HELP: "Self-help",
  OTHER: "Other",
};

const priceFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  currencyDisplay: "code",
});

export function formatBookPrice(price: number) {
  return priceFormatter.format(price);
}
