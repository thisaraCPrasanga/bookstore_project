package com.thisara.bookstore.cart.internal;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ChangeQuantityRequest(

        @NotNull(message = "Quantity is required.")
        @Min(value = 1, message = "Quantity must be at least {value}.")
        @Max(value = 99, message = "Quantity must be at most {value}.")
        Integer quantity
) {
}