package com.thisara.bookstore.payment.internal;

import org.springframework.data.jpa.repository.JpaRepository;

interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
}