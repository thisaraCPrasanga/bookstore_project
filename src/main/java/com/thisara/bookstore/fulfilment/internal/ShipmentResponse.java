package com.thisara.bookstore.fulfilment.internal;

import java.time.Instant;

public record ShipmentResponse(
        Long id,
        Long orderId,
        ShipmentStatus status,
        String trackingNumber,
        ShipmentAddress address,
        Instant shippedAt,
        Instant deliveredAt,
        Instant createdAt
) {

    static ShipmentResponse from(Shipment shipment) {
        return new ShipmentResponse(
                shipment.getId(),
                shipment.getOrderId(),
                shipment.getStatus(),
                shipment.getTrackingNumber(),
                shipment.getAddress(),
                shipment.getShippedAt(),
                shipment.getDeliveredAt(),
                shipment.getCreatedAt());
    }
}