package com.thisara.bookstore.user.internal;

public record LoginResponse(
        String token,
        Long userId,
        String email,
        String firstName,
        String lastName,
        Role role
) {
}
