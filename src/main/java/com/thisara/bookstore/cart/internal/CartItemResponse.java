package com.thisara.bookstore.cart.internal;

import com.thisara.bookstore.catalog.Format;

import java.math.BigDecimal;

public record CartItemResponse(
        Long bookId,
        String title,
        String author,
        Format format,
        BigDecimal unitPrice,
        int quantity,
        BigDecimal lineTotal,
        boolean available
) {
}