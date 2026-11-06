package com.thisara.bookstore.fulfilment.internal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    Page<Shipment> findByStatus(ShipmentStatus status, Pageable pageable);

}