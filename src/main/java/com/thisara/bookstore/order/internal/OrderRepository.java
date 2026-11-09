package com.thisara.bookstore.order.internal;

import com.thisara.bookstore.order.OrderStatus;
import org.springframework.data.domain.Limit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;

interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUserId(Long userId, Pageable pageable);

    List<Order> findByStatusAndCreatedAtBeforeOrderByCreatedAtAsc(OrderStatus status, Instant cutoff, Limit limit);

    @Query("""
            SELECT new com.thisara.bookstore.order.internal.OrderStatusTotal(
                o.status, COUNT(o), SUM(o.totalAmount))
            FROM Order o
            GROUP BY o.status
            """)
    List<OrderStatusTotal> findStatusTotals();
}