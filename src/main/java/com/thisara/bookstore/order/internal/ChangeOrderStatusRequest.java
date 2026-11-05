package com.thisara.bookstore.order.internal;

import com.thisara.bookstore.order.OrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ChangeOrderStatusRequest(

        @NotNull(message = "Status is required")
        OrderStatus status,

        @Size(max = 255, message = "Note must be at most {max} characters")
        String note
) {
}