package com.thisara.bookstore.payment.internal;

public record PayHereNotification(
        String merchantId,
        String orderId,
        String paymentId,
        String payhereAmount,
        String payhereCurrency,
        String statusCode,
        String md5sig,
        String method,
        String statusMessage
) {
}