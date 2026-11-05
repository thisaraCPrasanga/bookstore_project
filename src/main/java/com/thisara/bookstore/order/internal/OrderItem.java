package com.thisara.bookstore.order.internal;

import com.thisara.bookstore.catalog.Format;
import com.thisara.bookstore.order.FulfilmentStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

@Entity
@Table(name = "order_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false, updatable = false)
    @Getter(AccessLevel.NONE)
    private Order order;

    @Column(nullable = false, updatable = false)
    private Long bookId;

    @Column(nullable = false, updatable = false)
    private String bookTitle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, updatable = false)
    private Format bookFormat;

    @Column(nullable = false, updatable = false)
    private BigDecimal unitPrice;

    @Column(nullable = false, updatable = false)
    private int quantity;

    @Column(nullable = false, updatable = false)
    private BigDecimal lineTotal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FulfilmentStatus fulfilmentStatus;

    OrderItem(Order order, OrderLine line) {
        if (line.quantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero, but was " + line.quantity());
        }

        this.order = Objects.requireNonNull(order, "order must not be null");
        this.bookId = Objects.requireNonNull(line.bookId(), "bookId must not be null");
        this.bookTitle = Objects.requireNonNull(line.bookTitle(), "bookTitle must not be null");
        this.bookFormat = Objects.requireNonNull(line.bookFormat(), "bookFormat must not be null");
        this.unitPrice = Objects.requireNonNull(line.unitPrice(), "unitPrice must not be null")
                .setScale(2, RoundingMode.UNNECESSARY);
        this.quantity = line.quantity();
        this.lineTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
        this.fulfilmentStatus = FulfilmentStatus.PENDING;
    }

    void cancel() {
        fulfilmentStatus = FulfilmentStatus.CANCELLED;
    }
}