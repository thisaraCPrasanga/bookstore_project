package com.thisara.bookstore.order.internal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PlaceOrderRequest(

        @NotBlank(message = "Full name is required")
        @Size(max = 200, message = "Full name must be at most {max} characters")
        String fullName,

        @NotBlank(message = "Phone is required")
        @Pattern(regexp = "^\\+?[0-9]{9,15}$",
                message = "Phone must have 9 to 15 digits, with an optional + at the start")
        String phone,

        @NotBlank(message = "Address line 1 is required")
        @Size(max = 255, message = "Address line 1 must be at most {max} characters")
        String addressLine1,

        @Size(max = 255, message = "Address line 2 must be at most {max} characters")
        String addressLine2,

        @NotBlank(message = "City is required")
        @Size(max = 100, message = "City must be at most {max} characters")
        String city,

        @Size(max = 20, message = "Postal code must be at most {max} characters")
        String postalCode,

        @NotBlank(message = "Country is required")
        @Size(max = 60, message = "Country must be at most {max} characters")
        String country
) {

    OrderAddress toAddress() {
        return new OrderAddress(
                fullName.strip(),
                phone,
                addressLine1.strip(),
                blankToNull(addressLine2),
                city.strip(),
                blankToNull(postalCode),
                country.strip());
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }
}