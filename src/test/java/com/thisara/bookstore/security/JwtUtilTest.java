package com.thisara.bookstore.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Encoders;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;

public class JwtUtilTest {

    private static final String TEST_SECRET = "dGVzdC1zZWNyZXQtdGVzdC1zZWNyZXQtdGVzdC0xMjM=";
    private static final JwtUtil jwtUtil = new JwtUtil(TEST_SECRET, 60);

    @Test
    void tokenCarriesUserIdEmailAndRole() {

//        Arrange and Act
        String token = jwtUtil.generateToken(1L, "thisara@gmail.com", "CUSTOMER");
        Claims claims = jwtUtil.parseToken(token);

//        Assert
        assertThat(claims.getSubject()).isEqualTo(("1"));
        assertThat(claims.get("email", String.class)).isEqualTo("thisara@gmail.com");
        assertThat(claims.get("role", String.class)).isEqualTo("CUSTOMER");
    }

    @Test
    void tokenSignedWithAnotherKeyIsRejected() {
        String attackerSecret = Encoders.BASE64.encode(Jwts.SIG.HS256.key().build().getEncoded());
        JwtUtil attackerJwtUtil = new JwtUtil(attackerSecret, 60);
        String fakeAdminToken = attackerJwtUtil.generateToken(1L, "nimal@example.com", "ADMIN");

        assertThatThrownBy(() -> jwtUtil.parseToken(fakeAdminToken))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void expiredTokenIsRejected() {
        JwtUtil expiredJwtUtil = new JwtUtil(TEST_SECRET, -1);
        String expiredToken = expiredJwtUtil.generateToken(1L, "nimal@example.com", "CUSTOMER");

        assertThatThrownBy(() -> jwtUtil.parseToken(expiredToken))
                .isInstanceOf(ExpiredJwtException.class);
    }

    @Test
    void textThatIsNotATokenIsRejected() {
        assertThatThrownBy(() -> jwtUtil.parseToken("not-a-token"))
                .isInstanceOf(JwtException.class);
    }
}
