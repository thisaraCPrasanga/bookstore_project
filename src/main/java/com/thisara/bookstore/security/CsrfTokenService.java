package com.thisara.bookstore.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.stereotype.Service;

@Service
public class CsrfTokenService {

    private final CsrfTokenRepository repository;

    public CsrfTokenService(CsrfTokenRepository repository) {
        this.repository = repository;
    }

    public void rotateToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        org.springframework.security.web.csrf.CsrfToken newToken = repository.generateToken(request);

        repository.saveToken(newToken, request, response);
    }
}