package com.thisara.bookstore.user.Internal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.thisara.bookstore.security.JwtUtil;
import com.thisara.bookstore.security.SecurityConfig;
import java.util.List;

import com.thisara.bookstore.user.internal.Role;
import com.thisara.bookstore.user.internal.UserController;
import com.thisara.bookstore.user.internal.UserResponse;
import com.thisara.bookstore.user.internal.UserService;
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
@Import({SecurityConfig.class, JwtUtil.class})
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
                        .header(HttpHeaders.AUTHORIZATION, "Bearer not-a-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void meUsesTheIdFromTheToken() throws Exception {
        when(userService.getById(1L)).thenReturn(nimal());

        mockMvc.perform(get("/api/v1/users/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + customerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("nimal@example.com"));

        verify(userService).getById(1L);
    }

    @Test
    void customerCannotListUsers() throws Exception {
        mockMvc.perform(get("/api/v1/users")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + customerToken()))
                .andExpect(status().isForbidden());

        verify(userService, never()).getAll();
    }

    @Test
    void adminCanListUsers() throws Exception {
        when(userService.getAll()).thenReturn(List.of(nimal()));

        mockMvc.perform(get("/api/v1/users")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("nimal@example.com"));
    }

    @Test
    void registerWorksWithoutToken() throws Exception {
        when(userService.register(any())).thenReturn(
                new UserResponse(3L, "kamal@example.com", "Kamal", "Silva", null, Role.CUSTOMER));

        mockMvc.perform(post("/api/v1/users/register")
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
}