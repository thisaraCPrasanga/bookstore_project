package com.thisara.bookstore.order.internal;

import com.thisara.bookstore.catalog.Format;
import com.thisara.bookstore.order.FulfilmentStatus;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long bookId,
        String bookTitle,
        Format bookFormat,
        BigDecimal unitPrice,
        int quantity,
        BigDecimal lineTotal,
        FulfilmentStatus fulfilmentStatus
) {

    static OrderItemResponse from(OrderItem item) {
        return new OrderItemResponse(
                item.getBookId(),
                item.getBookTitle(),
                item.getBookFormat(),
                item.getUnitPrice(),
                item.getQuantity(),
                item.getLineTotal(),
                item.getFulfilmentStatus());
    }
}