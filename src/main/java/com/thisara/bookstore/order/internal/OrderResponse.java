package com.thisara.bookstore.order.internal;

import com.thisara.bookstore.order.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderNumber,
        String customerEmail,
        OrderStatus status,
        BigDecimal subtotal,
        BigDecimal deliveryFee,
        BigDecimal totalAmount,
        String currency,
        OrderAddress address,
        List<OrderItemResponse> items,
        Instant paidAt,
        Instant createdAt
) {

    static OrderResponse from(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getCustomerEmail(),
                order.getStatus(),
                order.getSubtotal(),
                order.getDeliveryFee(),
                order.getTotalAmount(),
                order.getCurrency(),
                order.getAddress(),
                order.getItems().stream().map(OrderItemResponse::from).toList(),
                order.getPaidAt(),
                order.getCreatedAt());
    }
}