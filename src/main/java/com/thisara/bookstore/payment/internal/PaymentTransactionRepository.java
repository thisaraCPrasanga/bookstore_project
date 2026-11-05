package com.thisara.bookstore.payment.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Optional<PaymentTransaction> findByPayherePaymentId(String payherePaymentId);

    Optional<PaymentTransaction> findFirstByOrderNumberOrderByIdDesc(String orderNumber);

}