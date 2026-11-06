package com.thisara.bookstore.fulfilment.internal;

import org.springframework.data.jpa.repository.JpaRepository;

interface ShipmentRepository extends JpaRepository<Shipment, Long> {
}