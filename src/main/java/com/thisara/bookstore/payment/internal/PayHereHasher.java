package com.thisara.bookstore.payment.internal;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Component
class PayHereHasher {

    private final PayHereProperties properties;

    PayHereHasher(PayHereProperties properties) {
        this.properties = properties;
    }

    String forCheckout(String orderNumber, String amount, String currency) {
        return md5(properties.merchantId() + orderNumber + amount + currency
                + md5(properties.merchantSecret()));
    }

    private static String md5(String text) {
        try {
            MessageDigest digest = MessageDigest.getInstance("MD5");
            byte[] hash = digest.digest(text.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().withUpperCase().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("MD5 is not available", e);
        }
    }
}