package com.thisara.bookstore.fulfilment.internal;

import com.thisara.bookstore.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/shipments")
@PreAuthorize("hasRole('ADMIN')")
class ShipmentController {

    private final FulfilmentService fulfilmentService;

    ShipmentController(FulfilmentService fulfilmentService) {
        this.fulfilmentService = fulfilmentService;
    }

    @GetMapping
    public ResponseEntity<PagedModel<ShipmentResponse>> findShipments(
            @RequestParam(required = false) ShipmentStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(new PagedModel<>(fulfilmentService.findShipments(status, pageable)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ShipmentResponse> updateShipment(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody UpdateShipmentRequest request) {
        return ResponseEntity.ok(fulfilmentService.updateShipment(id, request, user.email()));
    }
}