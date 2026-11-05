package com.thisara.bookstore.order.internal;

import com.thisara.bookstore.catalog.Format;

import java.math.BigDecimal;

public record OrderLine(
        Long bookId,
        String bookTitle,
        Format bookFormat,
        BigDecimal unitPrice,
        int quantity
) {
}