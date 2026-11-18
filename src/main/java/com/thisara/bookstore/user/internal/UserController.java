package com.thisara.bookstore.user.internal;

import com.thisara.bookstore.security.AuthCookieService;
import com.thisara.bookstore.security.AuthenticatedUser;
import com.thisara.bookstore.security.CsrfTokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final AuthCookieService authCookieService;
    private final CsrfTokenService csrfTokenService;

    UserController(UserService userService, AuthCookieService authCookieService,CsrfTokenService csrfTokenService){
        this.userService=userService;
        this.authCookieService= authCookieService;
        this.csrfTokenService=csrfTokenService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest registerRequest){
        UserResponse userResponse = userService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(userResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest,
                                               HttpServletRequest request,
                                               HttpServletResponse response) {
        LoginResult loginResult = userService.login(loginRequest);

        csrfTokenService.rotateToken(request,response);

        ResponseCookie cookie = authCookieService.createAuthCookies(loginResult.token());
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE,cookie.toString())
                .body(loginResult.user());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers(){
        return ResponseEntity.ok(userService.getAll());
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> changeRole(
            @PathVariable Long id,
            @Valid @RequestBody ChangeRoleRequest changeRoleRequest,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
            ){
        return ResponseEntity.ok(userService.changeRole(id,changeRoleRequest.role(),authenticatedUser.id()));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal AuthenticatedUser currentUser){
        return ResponseEntity.ok(userService.getById(currentUser.id()));

    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest request,
            HttpServletResponse response
    ) {

        csrfTokenService.rotateToken(request,response);

        ResponseCookie cookie =
                authCookieService.clearAuthCookies();

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

}
