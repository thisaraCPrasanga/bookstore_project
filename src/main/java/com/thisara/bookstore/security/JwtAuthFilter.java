package com.thisara.bookstore.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    JwtAuthFilter(JwtUtil jwtUtil){
        this.jwtUtil=jwtUtil;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    )throws ServletException, IOException
    {
        String token = extractTokenFromCookie(request);

        if (token!=null && !token.isBlank()){

            try{

                Claims claims = jwtUtil.parseToken(token);

                Long userId = Long.valueOf(claims.getSubject());
                String email = claims.get("email", String.class);
                String role = claims.get("role", String.class);

                if (userId <= 0 ||
                        email == null || email.isBlank() ||
                        role == null || role.isBlank()) {
                    throw new IllegalArgumentException(
                            "Invalid JWT claims"
                    );
                }

                AuthenticatedUser user = new AuthenticatedUser(
                        userId,
                        email,
                        role
                );

                Authentication authentication = new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_"+user.role()))
                );

                SecurityContext context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(authentication);
                SecurityContextHolder.setContext(context);


            }catch (JwtException | IllegalArgumentException ex){
                SecurityContextHolder.clearContext();

            }
        }

        filterChain.doFilter(request,response);


    }

    private String extractTokenFromCookie(
            HttpServletRequest request
    ) {
        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (AuthCookieService.AUTH_COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;

    }

}
