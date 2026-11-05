package com.thisara.bookstore.order.internal;

import com.thisara.bookstore.order.OrderApi;
import org.springframework.stereotype.Service;

@Service
class OrderApiImpl implements OrderApi {

    private final OrderService orderService;

    OrderApiImpl(OrderService orderService) {
        this.orderService = orderService;
    }

    @Override
    public void markPaid(Long orderId) {
        orderService.markPaid(orderId);
    }

    @Override
    public void cancel(Long orderId, String note) {
        orderService.cancelOrder(orderId, Order.CHANGED_BY_PAYHERE, note);
    }
}