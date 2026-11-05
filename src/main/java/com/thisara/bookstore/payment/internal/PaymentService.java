package com.thisara.bookstore.payment.internal;

import com.thisara.bookstore.order.OrderApi;
import com.thisara.bookstore.order.OrderDetails;
import com.thisara.bookstore.order.OrderStatus;
import com.thisara.bookstore.shared.BadRequestException;
import com.thisara.bookstore.shared.ConflictException;
import com.thisara.bookstore.shared.NotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@Transactional
class PaymentService {

    private final OrderApi orderApi;
    private final PaymentTransactionRepository transactionRepository;
    private final PayHereHasher hasher;
    private final PayHereProperties properties;

    PaymentService(OrderApi orderApi,
                   PaymentTransactionRepository transactionRepository,
                   PayHereHasher hasher,
                   PayHereProperties properties) {
        this.orderApi = orderApi;
        this.transactionRepository = transactionRepository;
        this.hasher = hasher;
        this.properties = properties;
    }

    public CheckoutResponse checkout(Long orderId, Long userId) {
        OrderDetails order = orderApi.findOrder(orderId);
        if (!order.userId().equals(userId)) {
            throw new NotFoundException("Order not found.");
        }
        if (order.status() != OrderStatus.PENDING_PAYMENT) {
            throw new ConflictException("This order cannot be paid.");
        }

        transactionRepository.save(new PaymentTransaction(
                order.id(), order.orderNumber(), order.totalAmount(), order.currency()));

        String amount = order.totalAmount().setScale(2, RoundingMode.UNNECESSARY).toPlainString();
        String hash = hasher.forCheckout(order.orderNumber(), amount, order.currency());
        String[] names = splitName(order.fullName());

        return new CheckoutResponse(
                properties.checkoutUrl(),
                properties.merchantId(),
                properties.returnUrl(),
                properties.cancelUrl(),
                properties.notifyUrl(),
                order.orderNumber(),
                "Order " + order.orderNumber(),
                order.currency(),
                amount,
                hash,
                names[0],
                names[1],
                order.customerEmail(),
                order.phone(),
                fullAddress(order),
                order.city(),
                order.country());
    }

    public void handleNotification(PayHereNotification notification) {
        if (!hasher.isValid(notification)) {
            throw new BadRequestException("Invalid PayHere signature.");
        }

        PaymentTransaction transaction = findTransaction(notification);
        if (!matchesCheckout(transaction, notification)) {
            throw new ConflictException("The payment does not match the checkout.");
        }

        short statusCode = Short.parseShort(notification.statusCode());
        PaymentStatus newStatus = PaymentStatus.fromPayHereCode(statusCode);

        if (transaction.getStatus() == PaymentStatus.SUCCESS && newStatus != PaymentStatus.CHARGEDBACK) {
            if (!notification.paymentId().equals(transaction.getPayherePaymentId())) {
                log.warn("Refund needed: order {} was paid twice", notification.orderId());
            }
            return;
        }

        transaction.recordResult(notification.paymentId(), statusCode,
                notification.method(), notification.statusMessage());
        updateOrder(transaction, newStatus);
    }

    private PaymentTransaction findTransaction(PayHereNotification notification) {
        return transactionRepository.findByPayherePaymentId(notification.paymentId())
                .or(() -> transactionRepository.findFirstByOrderNumberOrderByIdDesc(notification.orderId()))
                .orElseThrow(() -> new NotFoundException("Payment not found."));
    }

    private static boolean matchesCheckout(PaymentTransaction transaction, PayHereNotification notification) {
        return new BigDecimal(notification.payhereAmount()).compareTo(transaction.getAmount()) == 0
                && transaction.getCurrency().equals(notification.payhereCurrency());
    }

    private void updateOrder(PaymentTransaction transaction, PaymentStatus status) {
        if (status != PaymentStatus.SUCCESS) {
            log.info("Order {} payment status is {}", transaction.getOrderNumber(), status);
            return;
        }

        OrderDetails order = orderApi.findOrder(transaction.getOrderId());
        if (order.status() == OrderStatus.CANCELLED) {
            log.warn("Refund needed: order {} was paid after it was cancelled", order.orderNumber());
            return;
        }

        orderApi.markPaid(order.id());
    }

    private void cancelIfUnpaid(OrderDetails order, String note) {
        if (order.status() == OrderStatus.PENDING_PAYMENT) {
            orderApi.cancel(order.id(), note);
        }
    }

    private static String[] splitName(String fullName) {
        String[] parts = fullName.strip().split("\\s+", 2);
        return parts.length == 2 ? parts : new String[] {parts[0], parts[0]};
    }

    private static String fullAddress(OrderDetails order) {
        return order.addressLine2() == null
                ? order.addressLine1()
                : order.addressLine1() + ", " + order.addressLine2();
    }
}