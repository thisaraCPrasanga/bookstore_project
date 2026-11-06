package com.thisara.bookstore.fulfilment.internal;

import com.thisara.bookstore.shared.ConflictException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "shipments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private Long orderId;

    @Column(nullable = false, updatable = false)
    private Long userId;

    @Embedded
    private ShipmentAddress address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus status;

    private String trackingNumber;

    private Instant shippedAt;

    private Instant deliveredAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    public Shipment(Long orderId, Long userId, ShipmentAddress address) {
        this.orderId = Objects.requireNonNull(orderId, "orderId must not be null");
        this.userId = Objects.requireNonNull(userId, "userId must not be null");
        this.address = Objects.requireNonNull(address, "address must not be null");
        this.status = ShipmentStatus.PENDING;
    }

    public void markShipped(String trackingNumber) {
        if (status != ShipmentStatus.PENDING) {
            throw new ConflictException("Only a pending shipment can be shipped.");
        }
        this.status = ShipmentStatus.SHIPPED;
        this.trackingNumber = trackingNumber;
        this.shippedAt = Instant.now();
    }

    public void markDelivered() {
        if (status != ShipmentStatus.SHIPPED) {
            throw new ConflictException("Only a shipped parcel can be delivered.");
        }
        this.status = ShipmentStatus.DELIVERED;
        this.deliveredAt = Instant.now();
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