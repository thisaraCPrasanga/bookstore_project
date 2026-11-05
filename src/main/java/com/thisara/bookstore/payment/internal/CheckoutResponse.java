package com.thisara.bookstore.payment.internal;

public record CheckoutResponse(
        String checkoutUrl,
        String merchantId,
        String returnUrl,
        String cancelUrl,
        String notifyUrl,
        String orderId,
        String items,
        String currency,
        String amount,
        String hash,
        String firstName,
        String lastName,
        String email,
        String phone,
        String address,
        String city,
        String country
) {
}