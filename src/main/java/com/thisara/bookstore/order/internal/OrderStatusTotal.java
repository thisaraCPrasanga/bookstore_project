package com.thisara.bookstore.order.internal;

import com.thisara.bookstore.order.OrderStatus;

import java.math.BigDecimal;

public record OrderStatusTotal(OrderStatus status, Long orderCount, BigDecimal amountSum) {
}