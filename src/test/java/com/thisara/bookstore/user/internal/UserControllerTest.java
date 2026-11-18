package com.thisara.bookstore.user.internal;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.thisara.bookstore.security.AuthCookieService;
import com.thisara.bookstore.security.CsrfTokenService;
import com.thisara.bookstore.security.JwtUtil;
import com.thisara.bookstore.security.SecurityConfig;
import java.util.List;

import com.thisara.bookstore.shared.InvalidCredentialsException;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(UserController.class)
@Import({SecurityConfig.class, JwtUtil.class, AuthCookieService.class, CsrfTokenService.class})
@TestPropertySource(properties = {
        "app.jwt.secret=dGVzdC1zZWNyZXQtdGVzdC1zZWNyZXQtdGVzdC0xMjM=",
        "app.jwt.expiration-minutes=60"
})
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @MockitoBean
    private UserService userService;

    private String customerToken() {
        return jwtUtil.generateToken(1L, "nimal@example.com", "CUSTOMER");
    }

    private String adminToken() {
        return jwtUtil.generateToken(2L, "admin@example.com", "ADMIN");
    }

    private UserResponse nimal() {
        return new UserResponse(1L, "nimal@example.com", "Nimal", "Perera", null, Role.CUSTOMER);
    }

    @Test
    void meWithoutTokenReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void meWithBrokenTokenReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                        .cookie(new Cookie(
                                AuthCookieService.AUTH_COOKIE_NAME,
                                "not-a-token"
                        )))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void meUsesTheIdFromTheToken() throws Exception {
        when(userService.getById(1L)).thenReturn(nimal());

        mockMvc.perform(get("/api/v1/users/me")
                        .cookie(new Cookie(
                                AuthCookieService.AUTH_COOKIE_NAME,
                                customerToken()
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("nimal@example.com"));

        verify(userService).getById(1L);
    }

    @Test
    void customerCannotListUsers() throws Exception {
        mockMvc.perform(get("/api/v1/users")
                        .cookie(new Cookie(
                                AuthCookieService.AUTH_COOKIE_NAME,
                                customerToken()
                        )))
                .andExpect(status().isForbidden());

        verify(userService, never()).getAll();
    }

    @Test
    void adminCanListUsers() throws Exception {
        when(userService.getAll()).thenReturn(List.of(nimal()));

        mockMvc.perform(get("/api/v1/users")
                        .cookie(new Cookie(
                                AuthCookieService.AUTH_COOKIE_NAME,
                                adminToken()
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("nimal@example.com"));
    }

    @Test
    void registerWorksWithoutToken() throws Exception {
        when(userService.register(any())).thenReturn(
                new UserResponse(3L, "kamal@example.com", "Kamal", "Silva", null, Role.CUSTOMER));

        mockMvc.perform(post("/api/v1/users/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "kamal@example.com",
                                  "password": "secret123",
                                  "firstName": "Kamal",
                                  "lastName": "Silva"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("CUSTOMER"));
    }


    @Test
    void loginSetsJwtCookie() throws Exception {

        String token = customerToken();

        LoginResponse loginResponse = new LoginResponse(
                1L,
                "nimal@example.com",
                "Nimal",
                "Perera",
                Role.CUSTOMER
        );

        when(userService.login(any(LoginRequest.class)))
                .thenReturn(new LoginResult(token, loginResponse));

        mockMvc.perform(post("/api/v1/users/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "email": "nimal@example.com",
                              "password": "secret123"
                            }
                            """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email")
                        .value("nimal@example.com"))
                .andExpect(jsonPath("$.token").doesNotExist())
                .andExpect(result -> {
                    List<String> cookies = result.getResponse()
                            .getHeaders(HttpHeaders.SET_COOKIE);

                    assertTrue(cookies.stream().anyMatch(
                            header -> header.startsWith(
                                    AuthCookieService.AUTH_COOKIE_NAME
                                            + "=" + token + ";"
                            )
                    ));
                });
    }

    @Test
    void loginWithoutCsrfReturns403()throws Exception{
        mockMvc.perform(post("/api/v1/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                .content("""
                                {
                                "email":"nimal@gamil.com",
                                "password":"secret123"
                                }
                                """
                ))
                .andExpect(status().isForbidden());
//        this verify this method never run
                verify(userService,never()).login(any(LoginRequest.class));
    }


    @Test
    void logoutClearsJwtCookie() throws Exception {

        mockMvc.perform(post("/api/v1/users/logout")
                        .with(csrf())
                        .cookie(new Cookie(
                                AuthCookieService.AUTH_COOKIE_NAME,
                                customerToken()
                        )))
                .andExpect(status().isNoContent())
                .andExpect(result -> {

                    List<String> cookies = result.getResponse()
                            .getHeaders(HttpHeaders.SET_COOKIE);

                    assertTrue(cookies.stream().anyMatch(
                            header -> header.startsWith(
                                    AuthCookieService.AUTH_COOKIE_NAME + "=;"
                            ) && header.contains("Max-Age=0")
                    ));
                });
    }


    @Test
    void logoutWithoutCsrfReturns403() throws Exception {

        mockMvc.perform(post("/api/v1/users/logout")
                        .cookie(new Cookie(
                                AuthCookieService.AUTH_COOKIE_NAME,
                                customerToken()
                        )))
                .andExpect(status().isForbidden());
    }


    @Test
    void loginWithInvalidCredentialsReturns401() throws Exception {

        when(userService.login(any(LoginRequest.class)))
                .thenThrow(new InvalidCredentialsException());

        mockMvc.perform(post("/api/v1/users/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "email": "nimal@example.com",
                              "password": "wrongpassword"
                            }
                            """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail")
                        .value("Invalid email or password"));
    }


    @Test
    void loginWithInvalidCsrfReturns403() throws Exception {

        mockMvc.perform(post("/api/v1/users/login")
                        .with(csrf().useInvalidToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "email": "nimal@example.com",
                              "password": "secret123"
                            }
                            """))
                .andExpect(status().isForbidden());

        verify(userService, never())
                .login(any(LoginRequest.class));
    }



}