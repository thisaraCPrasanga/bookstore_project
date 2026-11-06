package com.thisara.bookstore.fulfilment.internal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateShipmentRequest(

        @NotNull(message = "Status is required")
        ShipmentStatus status,

        @Size(max = 50, message = "Tracking number must be at most {max} characters")
        String trackingNumber
) {
}