package com.thisara.bookstore.catalog;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface CatalogApi {

    Optional<BookSummary> findBook(Long bookId);
    void reduceStock(Long bookId, int quantity);
    void returnStock(Long bookId, int quantity);
    Map<Long, BookSummary> findBooks(Collection<Long> bookIds);
//
//    @param threshold //the highest stock that counts as low (0 or more)
//    @param limit    // the most books to return (1 or more)
    List<BookSummary> findLowStockBooks(int threshold, int limit);

}
