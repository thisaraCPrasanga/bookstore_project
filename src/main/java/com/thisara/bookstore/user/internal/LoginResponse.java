package com.thisara.bookstore.user.internal;

public record LoginResponse(
        Long userId,
        String email,
        String firstName,
        String lastName,
        Role role
) {
}
