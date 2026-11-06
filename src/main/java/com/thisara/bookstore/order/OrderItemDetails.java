package com.thisara.bookstore.order;

import com.thisara.bookstore.catalog.Format;

public record OrderItemDetails(Long id, Long bookId, Format bookFormat) {
}