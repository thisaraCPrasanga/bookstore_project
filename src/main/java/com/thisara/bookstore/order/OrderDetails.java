package com.thisara.bookstore.order;

import java.math.BigDecimal;
import java.util.List;

public record OrderDetails(
        Long id,
        String orderNumber,
        Long userId,
        String customerEmail,
        OrderStatus status,
        BigDecimal totalAmount,
        String currency,
        String fullName,
        String phone,
        String addressLine1,
        String addressLine2,
        String city,
        String postalCode,
        String country,
        List<OrderItemDetails> items
) {
}