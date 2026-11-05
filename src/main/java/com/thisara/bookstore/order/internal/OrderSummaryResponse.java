package com.thisara.bookstore.order.internal;

import com.thisara.bookstore.order.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record OrderSummaryResponse(
        Long id,
        String orderNumber,
        String customerEmail,
        OrderStatus status,
        BigDecimal totalAmount,
        String currency,
        Instant createdAt
) {

    static OrderSummaryResponse from(Order order) {
        return new OrderSummaryResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getCustomerEmail(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getCurrency(),
                order.getCreatedAt());
    }
}