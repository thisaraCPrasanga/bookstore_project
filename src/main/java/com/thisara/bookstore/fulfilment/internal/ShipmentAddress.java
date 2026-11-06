package com.thisara.bookstore.fulfilment.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public record ShipmentAddress(
        @Column(nullable = false, updatable = false) String fullName,
        @Column(nullable = false, updatable = false) String phone,
        @Column(name = "address_line1", nullable = false, updatable = false) String addressLine1,
        @Column(name = "address_line2", updatable = false) String addressLine2,
        @Column(nullable = false, updatable = false) String city,
        @Column(updatable = false) String postalCode
) {
}