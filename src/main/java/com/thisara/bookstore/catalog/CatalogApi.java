package com.thisara.bookstore.catalog;

import com.thisara.bookstore.catalog.internal.Book;

import java.math.BigDecimal;
import java.util.Optional;

public interface CatalogApi {

    Optional<BookSummary> findBook(Long bookId);
    void reduceStock(Long bookId, int quantity);
    void returnBook(Long bookId, int quantity);
}
