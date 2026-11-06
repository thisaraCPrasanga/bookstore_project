package com.thisara.bookstore.order.internal;

import com.thisara.bookstore.catalog.Format;
import com.thisara.bookstore.order.OrderStatus;
import com.thisara.bookstore.shared.ConflictException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Order {

    static final String CHANGED_BY_SYSTEM = "SYSTEM";
    static final String CHANGED_BY_PAYHERE = "PAYHERE";
    private static final String CURRENCY = "LKR";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private String orderNumber;

    @Column(nullable = false, updatable = false)
    private Long userId;

    @Column(nullable = false, updatable = false)
    private String customerEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Column(nullable = false, updatable = false)
    private BigDecimal subtotal;

    @Column(nullable = false, updatable = false)
    private BigDecimal deliveryFee;

    @Column(nullable = false, updatable = false)
    private BigDecimal totalAmount;

    @Column(nullable = false, updatable = false)
    private String currency;

    @Embedded
    private OrderAddress address;

    private Instant paidAt;


    @Version
    private Long version;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    @Getter(AccessLevel.NONE)
    private List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("changedAt ASC, id ASC")
    @Getter(AccessLevel.NONE)
    private List<OrderStatusHistory> history = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    public Order(String orderNumber, Long userId, String customerEmail,
                 BigDecimal deliveryFee, OrderAddress address, List<OrderLine> lines) {
        Objects.requireNonNull(lines, "lines must not be null");
        if (lines.isEmpty()) {
            throw new IllegalArgumentException("An order needs at least one item");
        }

        this.orderNumber = Objects.requireNonNull(orderNumber, "orderNumber must not be null");
        this.userId = Objects.requireNonNull(userId, "userId must not be null");
        this.customerEmail = Objects.requireNonNull(customerEmail, "customerEmail must not be null");
        this.deliveryFee = money(deliveryFee);
        this.address = Objects.requireNonNull(address, "address must not be null");
        this.currency = CURRENCY;
        this.status = OrderStatus.PENDING_PAYMENT;
        this.subtotal = money(BigDecimal.ZERO);

        for (OrderLine line : lines) {
            OrderItem item = new OrderItem(this, line);
            items.add(item);
            subtotal = subtotal.add(item.getLineTotal());
        }

        totalAmount = subtotal.add(this.deliveryFee);
        addHistory(null, status, CHANGED_BY_SYSTEM, "Order placed");
    }

    public List<OrderItem> getItems() {
        return Collections.unmodifiableList(items);
    }

    public List<OrderStatusHistory> getHistory() {
        return Collections.unmodifiableList(history);
    }

    public void changeStatus(OrderStatus next, String changedBy, String note) {
        Objects.requireNonNull(next, "next must not be null");
        if (!status.canChangeTo(next)) {
            throw new ConflictException("An order cannot change from " + status + " to " + next + ".");
        }
        checkFormatRule(next);

        OrderStatus previous = status;
        status = next;

        if (next == OrderStatus.PAID) {
            paidAt = Instant.now();
        }
        if (next == OrderStatus.CANCELLED) {
            items.forEach(OrderItem::cancel);
        }

        addHistory(previous, next, changedBy, note);
    }

    private void checkFormatRule(OrderStatus next) {
        boolean printed = hasPrintedBook();

        if (status == OrderStatus.PAID && next == OrderStatus.DELIVERED && printed) {
            throw new ConflictException("An order with a printed book must be shipped first.");
        }
        if (!printed && (next == OrderStatus.PROCESSING || next == OrderStatus.SHIPPED)) {
            throw new ConflictException("An ebook-only order has no parcel.");
        }
    }

    public void startFulfilment() {
        items.stream()
                .filter(item -> item.getBookFormat() == Format.EBOOK)
                .forEach(OrderItem::deliver);

        if (hasPrintedBook()) {
            changeStatus(OrderStatus.PROCESSING, CHANGED_BY_SYSTEM, "Parcel is being prepared");
        } else {
            changeStatus(OrderStatus.DELIVERED, CHANGED_BY_SYSTEM, "Ebook is ready to download");
        }
    }

    private boolean hasPrintedBook() {
        return items.stream().anyMatch(item -> item.getBookFormat() == Format.PHYSICAL);
    }

    private void addHistory(OrderStatus from, OrderStatus to, String changedBy, String note) {
        history.add(new OrderStatusHistory(this, from, to, changedBy, note));
    }

    private static BigDecimal money(BigDecimal amount) {
        return Objects.requireNonNull(amount, "amount must not be null")
                .setScale(2, RoundingMode.UNNECESSARY);
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}