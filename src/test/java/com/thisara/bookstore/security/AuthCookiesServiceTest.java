package com.thisara.bookstore.security;

import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseCookie;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

public class AuthCookiesServiceTest {

    @Test
    void createAuthCookiesSetsHttpOnly(){
        AuthCookieService service = new AuthCookieService(60);

        ResponseCookie cookie = service.createAuthCookies("test-token");

        assertTrue(cookie.isHttpOnly());
    }

    @Test
    void createAuthCookiesSetsSecure(){
        AuthCookieService service = new AuthCookieService(60);

        ResponseCookie cookie = service.createAuthCookies("test-token");

        assertTrue(cookie.isSecure());
    }

    @Test
    void createAuthCookiesSetsSameSite(){
        AuthCookieService service = new AuthCookieService(60);
        ResponseCookie cookie = service.createAuthCookies("test-token");
        assertEquals("Lax",cookie.getSameSite());
    }

    @Test
    void createAuthCookiesSetsPath() {
        AuthCookieService service = new AuthCookieService(60);

        ResponseCookie cookie = service.createAuthCookies("test-token");

        assertEquals("/", cookie.getPath());
    }

    @Test
    void createAuthCookiesSetsMaxAge() {
        AuthCookieService service = new AuthCookieService(60);

        ResponseCookie cookie = service.createAuthCookies("test-token");

        assertEquals(Duration.ofMinutes(60), cookie.getMaxAge());
    }


    @Test
    void clearAuthCookiesSetsMaxAgeToZero() {
        AuthCookieService service = new AuthCookieService(60);

        ResponseCookie cookie = service.clearAuthCookies();

        assertEquals(Duration.ZERO, cookie.getMaxAge());
    }

    @Test
    void clearAuthCookiesSetsEmptyValue() {
        AuthCookieService service = new AuthCookieService(60);

        ResponseCookie cookie = service.clearAuthCookies();

        assertEquals("", cookie.getValue());
    }


    @Test
    void createAuthCookiesRejectsEmptyToken() {
        AuthCookieService service = new AuthCookieService(60);

        assertThrows(
                IllegalArgumentException.class,
                () -> service.createAuthCookies("")
        );
    }


    @Test
    void createAuthCookiesRejectsNullToken() {
        AuthCookieService service = new AuthCookieService(60);

        assertThrows(
                IllegalArgumentException.class,
                () -> service.createAuthCookies(null)
        );
    }

    @Test
    void createAuthCookiesRejectsWhitespaceToken() {
        AuthCookieService service = new AuthCookieService(60);

        assertThrows(
                IllegalArgumentException.class,
                () -> service.createAuthCookies("   ")
        );
    }

}
