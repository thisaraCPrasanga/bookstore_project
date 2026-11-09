package com.thisara.bookstore.order.internal;

import com.thisara.bookstore.order.OrderStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record AdminStatsResponse(
        long totalOrders,
        Map<OrderStatus, Long> ordersByStatus,
        long paidOrders,
        BigDecimal totalSales,
        String currency,
        int lowStockThreshold,
        List<LowStockBookResponse> lowStockBooks) {
}