package com.thisara.bookstore.catalog;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;

public interface CatalogApi {

    Optional<BookSummary> findBook(Long bookId);
    void reduceStock(Long bookId, int quantity);
    void returnStock(Long bookId, int quantity);
    Map<Long, BookSummary> findBooks(Collection<Long> bookIds);
}
