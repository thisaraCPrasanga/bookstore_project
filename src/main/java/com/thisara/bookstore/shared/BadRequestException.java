package com.thisara.bookstore.shared;

public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}