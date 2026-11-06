package com.thisara.bookstore.fulfilment.internal;

import com.thisara.bookstore.catalog.BookSummary;
import com.thisara.bookstore.catalog.CatalogApi;
import com.thisara.bookstore.catalog.Format;
import com.thisara.bookstore.order.OrderApi;
import com.thisara.bookstore.order.OrderDetails;
import com.thisara.bookstore.order.OrderItemDetails;
import com.thisara.bookstore.shared.BadRequestException;
import com.thisara.bookstore.shared.NotFoundException;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
class FulfilmentService {

    private static final Sort OLDEST_FIRST = Sort.by(Sort.Direction.ASC, "createdAt", "id");
    private final OrderApi orderApi;
    private final CatalogApi catalogApi;
    private final DownloadGrantRepository grantRepository;
    private final ShipmentRepository shipmentRepository;
    private final EbookStorage ebookStorage;

    FulfilmentService(OrderApi orderApi,
                      CatalogApi catalogApi,
                      DownloadGrantRepository grantRepository,
                      ShipmentRepository shipmentRepository,
                      EbookStorage ebookStorage) {
        this.orderApi = orderApi;
        this.catalogApi = catalogApi;
        this.grantRepository = grantRepository;
        this.shipmentRepository = shipmentRepository;
        this.ebookStorage = ebookStorage;
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

    @Transactional(readOnly = true)
    public List<DownloadResponse> findMyDownloads(Long userId) {
        List<DownloadGrant> grants = grantRepository.findByUserIdOrderByCreatedAtDesc(userId);
        Map<Long, BookSummary> books = catalogApi.findBooks(
                grants.stream().map(DownloadGrant::getBookId).toList());

        return grants.stream()
                .map(grant -> DownloadResponse.from(grant, books.get(grant.getBookId())))
                .toList();
    }

    public EbookDownload download(UUID token, Long userId) {
        DownloadGrant grant = grantRepository.findByToken(token)
                .filter(found -> found.getUserId().equals(userId))
                .orElseThrow(() -> new NotFoundException("Download not found."));

        BookSummary book = catalogApi.findBook(grant.getBookId())
                .filter(found -> found.fileKey() != null)
                .orElseThrow(() -> new NotFoundException("The ebook file was not found."));

        grant.recordDownload(Instant.now());
        Resource file = ebookStorage.load(book.fileKey());

        return new EbookDownload(file, fileName(book));
    }

    @Transactional(readOnly = true)
    public Page<ShipmentResponse> findShipments(ShipmentStatus status, Pageable pageable) {
        Pageable page = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), OLDEST_FIRST);
        Page<Shipment> shipments = status == null
                ? shipmentRepository.findAll(page)
                : shipmentRepository.findByStatus(status, page);
        return shipments.map(ShipmentResponse::from);
    }

    public ShipmentResponse updateShipment(Long shipmentId, UpdateShipmentRequest request, String adminEmail) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new NotFoundException("Shipment not found."));

        switch (request.status()) {
            case SHIPPED -> {
                String trackingNumber = blankToNull(request.trackingNumber());
                shipment.markShipped(trackingNumber);
                orderApi.markShipped(shipment.getOrderId(), adminEmail, trackingNumber);
            }
            case DELIVERED -> {
                shipment.markDelivered();
                orderApi.markDelivered(shipment.getOrderId(), adminEmail);
            }
            case PENDING -> throw new BadRequestException("A shipment cannot go back to PENDING.");
        }

        return ShipmentResponse.from(shipment);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }

    private static String fileName(BookSummary book) {
        int dot = book.fileKey().lastIndexOf('.');
        String extension = dot >= 0 ? book.fileKey().substring(dot) : "";
        return book.title() + extension;
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