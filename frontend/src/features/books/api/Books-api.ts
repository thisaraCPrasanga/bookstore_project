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


export async function getBooks(title?: string, page:number = 0,author?:string, genre?:string): Promise<BookPage> {
  const response = await apiClient.get<BookPage>("/books", {
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

