package com.thisara.bookstore.order.internal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Component
class UnpaidOrderCancelJob {

    private static final Logger log = LoggerFactory.getLogger(UnpaidOrderCancelJob.class);

    private final OrderService orderService;
    private final Duration unpaidTimeout;
    private final int batchSize;

    UnpaidOrderCancelJob(OrderService orderService,
                         @Value("${app.order.unpaid-timeout}") Duration unpaidTimeout,
                         @Value("${app.order.cancel-job.batch-size}") int batchSize) {
        this.orderService = orderService;
        this.unpaidTimeout = unpaidTimeout;
        this.batchSize = batchSize;
    }

    @Scheduled(initialDelayString = "${app.order.cancel-job.initial-delay}",
            fixedDelayString = "${app.order.cancel-job.delay}")
    void cancelUnpaidOrders() {
        Instant cutoff = Instant.now().minus(unpaidTimeout);
        List<Long> orderIds = orderService.findUnpaidOrderIds(cutoff, batchSize);
        if (orderIds.isEmpty()) {
            return;
        }

        String note = "Not paid after " + unpaidTimeout.toMinutes() + " minutes";
        for (Long orderId : orderIds) {
            try {
                orderService.cancelUnpaidOrder(orderId, note);
            } catch (OptimisticLockingFailureException e) {
                log.info("Order {} changed while the cancel job ran. The next run checks it again.", orderId);
            } catch (RuntimeException e) {
                log.error("Could not cancel unpaid order {}", orderId, e);
            }
        }
        log.info("Cancel job checked {} unpaid orders", orderIds.size());
    }
}