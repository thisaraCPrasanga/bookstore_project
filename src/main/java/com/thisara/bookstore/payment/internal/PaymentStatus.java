package com.thisara.bookstore.payment.internal;

public enum PaymentStatus {

    INITIATED,
    PENDING,
    SUCCESS,
    CANCELLED,
    FAILED,
    CHARGEDBACK;

    static PaymentStatus fromPayHereCode(int code) {
        return switch (code) {
            case 2 -> SUCCESS;
            case 0 -> PENDING;
            case -1 -> CANCELLED;
            case -2 -> FAILED;
            case -3 -> CHARGEDBACK;
            default -> throw new IllegalArgumentException("Unknown PayHere status code: " + code);
        };
    }
}