package com.thisara.bookstore.order.internal;

import com.thisara.bookstore.catalog.BookSummary;
import com.thisara.bookstore.catalog.CatalogApi;
import com.thisara.bookstore.order.OrderStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
class AdminStatsService {

    private static final Set<OrderStatus> PAID_STATUSES = EnumSet.of(
            OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED);
    private static final int LOW_STOCK_LIMIT = 20;
    private static final String CURRENCY = "LKR";

    private final OrderRepository orderRepository;
    private final CatalogApi catalogApi;
    private final int lowStockThreshold;

    AdminStatsService(OrderRepository orderRepository,
                      CatalogApi catalogApi,
                      @Value("${app.stats.low-stock-threshold}") int lowStockThreshold) {
        if (lowStockThreshold < 0) {
            throw new IllegalArgumentException("app.stats.low-stock-threshold must be 0 or more");
        }
        this.orderRepository = orderRepository;
        this.catalogApi = catalogApi;
        this.lowStockThreshold = lowStockThreshold;
    }

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        Map<OrderStatus, Long> ordersByStatus = new EnumMap<>(OrderStatus.class);
        for (OrderStatus status : OrderStatus.values()) {
            ordersByStatus.put(status, 0L);
        }

        long totalOrders = 0;
        long paidOrders = 0;
        BigDecimal totalSales = BigDecimal.ZERO;

        for (OrderStatusTotal row : orderRepository.findStatusTotals()) {
            ordersByStatus.put(row.status(), row.orderCount());
            totalOrders += row.orderCount();
            if (PAID_STATUSES.contains(row.status())) {
                paidOrders += row.orderCount();
                totalSales = totalSales.add(row.amountSum());
            }
        }

        List<LowStockBookResponse> lowStockBooks = catalogApi
                .findLowStockBooks(lowStockThreshold, LOW_STOCK_LIMIT)
                .stream()
                .map(AdminStatsService::toLowStockBookResponse)
                .toList();

        return new AdminStatsResponse(
                totalOrders,
                ordersByStatus,
                paidOrders,
                totalSales.setScale(2, RoundingMode.UNNECESSARY),
                CURRENCY,
                lowStockThreshold,
                lowStockBooks);
    }

    private static LowStockBookResponse toLowStockBookResponse(BookSummary book) {
        return new LowStockBookResponse(book.id(), book.title(), book.author(), book.stock());
    }
}