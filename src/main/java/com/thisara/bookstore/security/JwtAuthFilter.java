package com.thisara.bookstore.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
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

    private static final String BEARER_PREFIX = "Bearer ";

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
        String header = request.getHeader("Authorization");

        if (header!=null && header.startsWith(BEARER_PREFIX)){
            String token = header.substring(BEARER_PREFIX.length());

            try{

                Claims claims = jwtUtil.parseToken(token);

                AuthenticatedUser user = new AuthenticatedUser(
                        Long.valueOf(claims.getSubject()),
                        claims.get("email", String.class),
                        claims.get("role", String.class)

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

}
