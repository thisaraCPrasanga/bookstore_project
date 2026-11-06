package com.thisara.bookstore.fulfilment.internal;

import com.thisara.bookstore.catalog.Format;
import com.thisara.bookstore.order.OrderApi;
import com.thisara.bookstore.order.OrderDetails;
import com.thisara.bookstore.order.OrderItemDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@Transactional
class FulfilmentService {

    private final OrderApi orderApi;
    private final DownloadGrantRepository grantRepository;
    private final ShipmentRepository shipmentRepository;

    FulfilmentService(OrderApi orderApi,
                      DownloadGrantRepository grantRepository,
                      ShipmentRepository shipmentRepository) {
        this.orderApi = orderApi;
        this.grantRepository = grantRepository;
        this.shipmentRepository = shipmentRepository;
    }

    public void fulfil(Long orderId) {
        OrderDetails order = orderApi.findOrder(orderId);
        Instant now = Instant.now();

        for (OrderItemDetails item : order.items()) {
            if (item.bookFormat() == Format.EBOOK) {
                grantRepository.save(new DownloadGrant(
                        order.userId(), order.id(), item.id(), item.bookId(), now));
            }
        }

        boolean hasPrintedBook = order.items().stream()
                .anyMatch(item -> item.bookFormat() == Format.PHYSICAL);
        if (hasPrintedBook) {
            shipmentRepository.save(new Shipment(order.id(), order.userId(), toAddress(order)));
        }

        orderApi.startFulfilment(order.id());
    }

    private static ShipmentAddress toAddress(OrderDetails order) {
        return new ShipmentAddress(
                order.fullName(),
                order.phone(),
                order.addressLine1(),
                order.addressLine2(),
                order.city(),
                order.postalCode());
    }
}