package com.thisara.bookstore.fulfilment.internal;

import com.thisara.bookstore.order.OrderPaidEvent;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
class OrderPaidListener {

    private final FulfilmentService fulfilmentService;

    OrderPaidListener(FulfilmentService fulfilmentService) {
        this.fulfilmentService = fulfilmentService;
    }

    @TransactionalEventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onOrderPaid(OrderPaidEvent event) {
        fulfilmentService.fulfil(event.orderId());
    }
}