package com.thisara.bookstore.user.internal;

public record LoginResult(
        String token,
        LoginResponse user
) {
}
