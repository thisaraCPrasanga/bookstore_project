package com.thisara.bookstore.cart.internal;

import com.thisara.bookstore.shared.ConflictException;
import com.thisara.bookstore.shared.NotFoundException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Entity
@Table(name = "carts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private Long userId;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("addedAt ASC, id ASC")
    @Getter(AccessLevel.NONE)
    private List<CartItem> items = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    public Cart(Long userId) {
        this.userId = Objects.requireNonNull(userId, "userId must not be null");
    }

    public List<CartItem> getItems() {
        return Collections.unmodifiableList(items);
    }

    public void addItem(Long bookId, int quantity, int maxQuantity) {
        checkQuantity(quantity);
        Optional<CartItem> existing = findItem(bookId);
        int newQuantity = existing.map(CartItem::getQuantity).orElse(0) + quantity;
        checkLimit(newQuantity, maxQuantity);

        if (existing.isPresent()) {
            existing.get().changeQuantity(newQuantity);
        } else {
            items.add(new CartItem(this, bookId, quantity));
        }
        touch();
    }

    public void changeQuantity(Long bookId, int quantity, int maxQuantity) {
        checkQuantity(quantity);
        CartItem item = findItem(bookId)
                .orElseThrow(() -> new NotFoundException("This book is not in your cart."));
        checkLimit(quantity, maxQuantity);
        item.changeQuantity(quantity);
        touch();
    }

    public void removeItem(Long bookId) {
        boolean removed = items.removeIf(item -> item.getBookId().equals(bookId));
        if (removed) {
            touch();
        }
    }

    public void clear() {
        if (!items.isEmpty()) {
            items.clear();
            touch();
        }
    }

    private Optional<CartItem> findItem(Long bookId) {
        return items.stream()
                .filter(item -> item.getBookId().equals(bookId))
                .findFirst();
    }

    private void touch() {
        updatedAt = Instant.now();
    }

    private static void checkQuantity(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero, but was " + quantity);
        }
    }

    private static void checkLimit(int newQuantity, int maxQuantity) {
        if (newQuantity > maxQuantity) {
            throw new ConflictException("You can have at most " + maxQuantity + " of this book in your cart.");
        }
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