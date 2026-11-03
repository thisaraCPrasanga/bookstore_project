package com.thisara.bookstore.cart.internal;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "cart_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cart_id", nullable = false, updatable = false)
    @Getter(AccessLevel.NONE)
    private Cart cart;

    @Column(nullable = false, updatable = false)
    private Long bookId;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false, updatable = false)
    private Instant addedAt;

    CartItem(Cart cart, Long bookId, int quantity) {
        this.cart = Objects.requireNonNull(cart, "cart must not be null");
        this.bookId = Objects.requireNonNull(bookId, "bookId must not be null");
        this.quantity = quantity;
    }

    void changeQuantity(int quantity) {
        this.quantity = quantity;
    }

    @PrePersist
    void onCreate() {
        addedAt = Instant.now();
    }
}