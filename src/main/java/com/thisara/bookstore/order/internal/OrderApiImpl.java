package com.thisara.bookstore.order.internal;

import com.thisara.bookstore.order.OrderApi;
import com.thisara.bookstore.order.OrderDetails;
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
    public OrderDetails findOrder(Long orderId) {
        return orderService.findDetails(orderId);
    }

    @Override
    public void startFulfilment(Long orderId) {
        orderService.startFulfilment(orderId);
    }

    @Override
    public void markShipped(Long orderId, String changedBy, String trackingNumber) {
        orderService.markShipped(orderId, changedBy, trackingNumber);
    }

    @Override
    public void markDelivered(Long orderId, String changedBy) {
        orderService.markDelivered(orderId, changedBy);
    }

}