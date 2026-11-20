import { apiClient } from "../../../lib/api-client";
import type { Book } from "./Book";

export interface BookPage {
  content: Book[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}


export async function getBooks(
  title?: string,
  page = 0,
  author?: string,
  genre?: string,
  signal?: AbortSignal,
): Promise<BookPage> {
  const response = await apiClient.get<BookPage>("/books", {
    signal,
    params: {
      title,
      page,
      size: 6,
      author,
      genre
    },
  });

  return response.data;
}

export async function getBookById(id: string, signal?: AbortSignal): Promise<Book> {
  const response = await apiClient.get<Book>(`/books/${id}`, { signal });

  return response.data;
}

