package com.thisara.bookstore.security;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CsrfController {

    @GetMapping("/api/v1/auth/csrf")
    public void csrf(CsrfToken csrfToken) {
        csrfToken.getToken();
    }
}