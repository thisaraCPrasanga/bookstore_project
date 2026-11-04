package com.thisara.bookstore.cart.internal;

import com.thisara.bookstore.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@PreAuthorize("hasRole('CUSTOMER')")
class CartController {

    private final CartService cartService;

    CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(cartService.getCart(user.id()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(@AuthenticationPrincipal AuthenticatedUser user,
                                                @Valid @RequestBody AddCartItemRequest request) {
        return ResponseEntity.ok(cartService.addItem(user.id(), request));
    }

    @PatchMapping("/items/{bookId}")
    public ResponseEntity<CartResponse> changeQuantity(@AuthenticationPrincipal AuthenticatedUser user,
                                                       @PathVariable Long bookId,
                                                       @Valid @RequestBody ChangeQuantityRequest request) {
        return ResponseEntity.ok(cartService.changeQuantity(user.id(), bookId, request));
    }

    @DeleteMapping("/items/{bookId}")
    public ResponseEntity<Void> removeItem(@AuthenticationPrincipal AuthenticatedUser user,
                                           @PathVariable Long bookId) {
        cartService.removeItem(user.id(), bookId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clear(@AuthenticationPrincipal AuthenticatedUser user) {
        cartService.clear(user.id());
        return ResponseEntity.noContent().build();
    }
}