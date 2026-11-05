package com.thisara.bookstore.payment.internal;

import com.thisara.bookstore.security.AuthenticatedUser;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
class PaymentController {

    private final PaymentService paymentService;

    PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/{orderId}/checkout")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CheckoutResponse> checkout(
            @PathVariable Long orderId,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(paymentService.checkout(orderId, user.id()));
    }

    @PostMapping("/payhere/notify")
    public ResponseEntity<Void> receiveNotification(
            @RequestParam("merchant_id") String merchantId,
            @RequestParam("order_id") String orderId,
            @RequestParam("payment_id") String paymentId,
            @RequestParam("payhere_amount") String payhereAmount,
            @RequestParam("payhere_currency") String payhereCurrency,
            @RequestParam("status_code") String statusCode,
            @RequestParam("md5sig") String md5sig,
            @RequestParam(value = "method", required = false) String method,
            @RequestParam(value = "status_message", required = false) String statusMessage) {
        paymentService.handleNotification(new PayHereNotification(
                merchantId, orderId, paymentId, payhereAmount, payhereCurrency,
                statusCode, md5sig, method, statusMessage));
        return ResponseEntity.ok().build();
    }
}