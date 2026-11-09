package com.thisara.bookstore.order.internal;

public record LowStockBookResponse(Long bookId, String title, String author, Integer stock) {
}