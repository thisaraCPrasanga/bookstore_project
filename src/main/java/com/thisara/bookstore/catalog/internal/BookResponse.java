package com.thisara.bookstore.catalog.internal;

import com.thisara.bookstore.catalog.Format;
import com.thisara.bookstore.catalog.Genre;

import java.math.BigDecimal;

public record BookResponse(
        Long id,
        String isbn,
        String title,
        String author,
        Genre genre,
        String publisher,
        Short publishedYear,
        String description,
        boolean descriptionByAi,
        String coverImageUrl,
        Format format,
        BigDecimal price,
        Integer stock,
        Long version
) {

    static BookResponse from(Book book) {
        return new BookResponse(
                book.getId(),
                book.getIsbn(),
                book.getTitle(),
                book.getAuthor(),
                book.getGenre(),
                book.getPublisher(),
                book.getPublishedYear(),
                book.getDescription(),
                book.isDescriptionByAi(),
                book.getCoverImageUrl(),
                book.getFormat(),
                book.getPrice(),
                book.getStock(),
                book.getVersion());
    }
}