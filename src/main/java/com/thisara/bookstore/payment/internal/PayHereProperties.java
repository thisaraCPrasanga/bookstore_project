package com.thisara.bookstore.payment.internal;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.payhere")
public record PayHereProperties(
        String merchantId,
        String merchantSecret,
        String checkoutUrl,
        String notifyUrl,
        String returnUrl,
        String cancelUrl
) {

    @Override
    public String toString() {
        return "PayHereProperties[merchantId=" + merchantId + "]";
    }
}