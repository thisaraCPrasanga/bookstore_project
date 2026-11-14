package com.thisara.bookstore.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class AuthCookieService {

    private final Duration expiration;
    public static final String AUTH_COOKIE_NAME = "__Host-access_token";

    public AuthCookieService(
            @Value("${app.jwt.expiration-minutes}") long expirationMinutes
    ){
        this.expiration = Duration.ofMinutes(expirationMinutes);
    }

    public ResponseCookie createAuthCookies(String token){
        if (token == null || token.isBlank()){
            throw new IllegalArgumentException("token cannot be empty");
        }
        return ResponseCookie.from(AUTH_COOKIE_NAME,token)
                .httpOnly(true)
                .secure(true)
                .sameSite("Lax")
                .path("/")
                .maxAge(expiration)
                .build();
    }

    public ResponseCookie clearAuthCookies(){
        return ResponseCookie.from(AUTH_COOKIE_NAME,"")
                .httpOnly(true)
                .secure(true)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ZERO)
                .build();
    }
}
