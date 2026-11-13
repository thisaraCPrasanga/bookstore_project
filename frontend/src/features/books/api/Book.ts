export interface Book {
  id: number;
  isbn: string;
  title: string;
  author: string;
  format: "EBOOK" | "PHYSICAL";
  price: number;
  stock: number | null;
  publisher: string | null;
  publishedYear: number | null;
  description: string | null;
  genre:
  | "FICTION"
  | "CHILDREN"
  | "EDUCATION"
  | "SCIENCE"
  | "PROGRAMMING"
  | "BUSINESS"
  | "HISTORY"
  | "BIOGRAPHY"
  | "SELF_HELP"
  | "OTHER";
  descriptionByAi: boolean;
  coverImageUrl: string | null;
  version: number;
}