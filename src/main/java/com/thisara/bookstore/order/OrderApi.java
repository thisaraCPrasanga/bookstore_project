package com.thisara.bookstore.order;

public interface OrderApi {

    void markPaid(Long orderId);

    void cancel(Long orderId, String note);
}