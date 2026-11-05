package com.thisara.bookstore.order.internal;

import com.thisara.bookstore.order.OrderStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "order_status_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OrderStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false, updatable = false)
    @Getter(AccessLevel.NONE)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(updatable = false)
    private OrderStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, updatable = false)
    private OrderStatus toStatus;

    @Column(nullable = false, updatable = false)
    private String changedBy;

    @Column(updatable = false)
    private String note;

    @Column(nullable = false, updatable = false)
    private Instant changedAt;

    OrderStatusHistory(Order order, OrderStatus fromStatus, OrderStatus toStatus,
                       String changedBy, String note) {
        this.order = Objects.requireNonNull(order, "order must not be null");
        this.fromStatus = fromStatus;
        this.toStatus = Objects.requireNonNull(toStatus, "toStatus must not be null");
        this.changedBy = Objects.requireNonNull(changedBy, "changedBy must not be null");
        this.note = note;
    }

    @PrePersist
    void onCreate() {
        changedAt = Instant.now();
    }
}