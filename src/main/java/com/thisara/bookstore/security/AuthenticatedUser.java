package com.thisara.bookstore.security;

public record AuthenticatedUser(
        Long id,
        String email,
        String role
) {
}
