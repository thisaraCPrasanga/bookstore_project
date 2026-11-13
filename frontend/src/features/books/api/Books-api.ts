import { apiClient } from "../../../lib/api-client";
import type { Book } from "./Book"

export interface BookPage {
  content: Book[],
  page: {
    size: number,
    number: number,
    totalElements: number,
    totalPages: number;
  };
}


export async function getBooks(title?: string): Promise<BookPage> {
  const response = await apiClient.get<BookPage>("/books", {
    params: {
      title,
    },
  });

  return response.data;
}

