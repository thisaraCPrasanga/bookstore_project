package com.thisara.bookstore.order;

public interface OrderApi {

    void markPaid(Long orderId);

    OrderDetails findOrder(Long orderId);

    void startFulfilment(Long orderId);

    void markShipped(Long orderId, String changedBy, String trackingNumber);

    void markDelivered(Long orderId, String changedBy);

}