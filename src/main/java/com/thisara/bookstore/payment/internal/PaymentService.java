package com.thisara.bookstore.payment.internal;

import com.thisara.bookstore.order.OrderApi;
import com.thisara.bookstore.order.OrderDetails;
import com.thisara.bookstore.order.OrderStatus;
import com.thisara.bookstore.shared.ConflictException;
import com.thisara.bookstore.shared.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.RoundingMode;

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