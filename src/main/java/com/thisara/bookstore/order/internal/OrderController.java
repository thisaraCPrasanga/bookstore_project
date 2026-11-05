package com.thisara.bookstore.order.internal;

import com.thisara.bookstore.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/orders")
class OrderController {

    private final OrderService orderService;

    OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderResponse> placeOrder(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody PlaceOrderRequest request) {
        OrderResponse order = orderService.placeOrder(user.id(), user.email(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }
}