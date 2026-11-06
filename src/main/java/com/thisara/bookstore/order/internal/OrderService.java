package com.thisara.bookstore.order.internal;

import com.thisara.bookstore.cart.CartApi;
import com.thisara.bookstore.cart.CartLine;
import com.thisara.bookstore.catalog.BookSummary;
import com.thisara.bookstore.catalog.CatalogApi;
import com.thisara.bookstore.catalog.Format;
import com.thisara.bookstore.order.OrderDetails;
import com.thisara.bookstore.order.OrderItemDetails;
import com.thisara.bookstore.order.OrderPaidEvent;
import com.thisara.bookstore.order.OrderStatus;
import com.thisara.bookstore.shared.BadRequestException;
import com.thisara.bookstore.shared.ConflictException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.thisara.bookstore.security.AuthenticatedUser;
import com.thisara.bookstore.shared.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@Transactional
class OrderService {

    private static final String PRINTED_BOOK_COUNTRY = "Sri Lanka";
    private static final ZoneId SHOP_ZONE = ZoneId.of("Asia/Colombo");
    private static final String ORDER_CODE_CHARACTERS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final int ORDER_CODE_LENGTH = 5;
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String ADMIN_ROLE = "ADMIN";
    private static final Sort NEWEST_FIRST = Sort.by(Sort.Direction.DESC, "createdAt", "id");

    private final OrderRepository orderRepository;
    private final CartApi cartApi;
    private final CatalogApi catalogApi;
    private final ApplicationEventPublisher eventPublisher;
    private final BigDecimal deliveryFee;

    OrderService(OrderRepository orderRepository,
                 CartApi cartApi,
                 CatalogApi catalogApi,
                 ApplicationEventPublisher eventPublisher,
                 @Value("${app.order.delivery-fee}") BigDecimal deliveryFee) {
        this.orderRepository = orderRepository;
        this.cartApi = cartApi;
        this.catalogApi = catalogApi;
        this.eventPublisher = eventPublisher;
        this.deliveryFee = deliveryFee;
    }

    public OrderResponse placeOrder(Long userId, String customerEmail, PlaceOrderRequest request) {
        List<CartLine> cartLines = cartApi.findLines(userId);
        if (cartLines.isEmpty()) {
            throw new BadRequestException("Your cart is empty.");
        }

        List<OrderLine> orderLines = toOrderLines(cartLines);
        OrderAddress address = request.toAddress();
        boolean hasPrintedBook = orderLines.stream()
                .anyMatch(line -> line.bookFormat() == Format.PHYSICAL);

        if (hasPrintedBook && !PRINTED_BOOK_COUNTRY.equalsIgnoreCase(address.country())) {
            throw new BadRequestException("Printed books can be delivered only inside Sri Lanka.");
        }

        for (OrderLine line : orderLines) {
            catalogApi.reduceStock(line.bookId(), line.quantity());
        }

        BigDecimal fee = hasPrintedBook ? deliveryFee : BigDecimal.ZERO;
        Order order = new Order(newOrderNumber(), userId, customerEmail, fee, address, orderLines);
        Order saved = orderRepository.save(order);

        cartApi.clear(userId);

        return OrderResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<OrderSummaryResponse> findMyOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, newestFirst(pageable))
                .map(OrderSummaryResponse::from);
    }

    @Transactional(readOnly = true)
    public OrderResponse findOrder(Long orderId, AuthenticatedUser user) {
        Order order = orderRepository.findById(orderId)
                .filter(found -> found.getUserId().equals(user.id()) || ADMIN_ROLE.equals(user.role()))
                .orElseThrow(() -> new NotFoundException("Order not found."));
        return OrderResponse.from(order);
    }

    @Transactional(readOnly = true)
    public OrderDetails findDetails(Long orderId) {
        Order order = findExisting(orderId);
        OrderAddress address = order.getAddress();

        return new OrderDetails(
                order.getId(),
                order.getOrderNumber(),
                order.getUserId(),
                order.getCustomerEmail(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getCurrency(),
                address.fullName(),
                address.phone(),
                address.addressLine1(),
                address.addressLine2(),
                address.city(),
                address.postalCode(),
                address.country(),
                order.getItems().stream()
                        .map(item -> new OrderItemDetails(item.getId(), item.getBookId(), item.getBookFormat()))
                        .toList());
    }

    @Transactional(readOnly = true)
    public Page<OrderSummaryResponse> findAllOrders(Pageable pageable) {
        return orderRepository.findAll(newestFirst(pageable))
                .map(OrderSummaryResponse::from);
    }

    public OrderResponse changeStatus(Long orderId, ChangeOrderStatusRequest request, String adminEmail) {
        if (request.status() == OrderStatus.PAID) {
            throw new BadRequestException("Only a successful payment can mark an order as paid.");
        }

        Order order = findExisting(orderId);
        if (request.status() == OrderStatus.CANCELLED) {
            cancelAndReturnStock(order, adminEmail, request.note());
        } else {
            order.changeStatus(request.status(), adminEmail, request.note());
        }

        return OrderResponse.from(order);
    }

    public void markPaid(Long orderId) {
        Order order = findExisting(orderId);
        if (order.getPaidAt() != null) {
            return;
        }

        order.changeStatus(OrderStatus.PAID, Order.CHANGED_BY_PAYHERE, "Payment received");
        eventPublisher.publishEvent(new OrderPaidEvent(order.getId()));
    }

    public void cancelOrder(Long orderId, String changedBy, String note) {
        Order order = findExisting(orderId);
        if (order.getStatus() == OrderStatus.CANCELLED) {
            return;
        }

        cancelAndReturnStock(order, changedBy, note);
    }

    private Order findExisting(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found."));
    }

    private void cancelAndReturnStock(Order order, String changedBy, String note) {
        order.changeStatus(OrderStatus.CANCELLED, changedBy, note);
        for (OrderItem item : order.getItems()) {
            catalogApi.returnStock(item.getBookId(), item.getQuantity());
        }
    }

    private static Pageable newestFirst(Pageable pageable) {
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), NEWEST_FIRST);
    }

    private List<OrderLine> toOrderLines(List<CartLine> cartLines) {
        Map<Long, BookSummary> books = catalogApi.findBooks(
                cartLines.stream().map(CartLine::bookId).toList());

        return cartLines.stream()
                .map(cartLine -> toOrderLine(cartLine, books.get(cartLine.bookId())))
                .toList();
    }

    private OrderLine toOrderLine(CartLine cartLine, BookSummary book) {
        if (book == null) {
            throw new ConflictException("A book in your cart is no longer available.");
        }
        return new OrderLine(book.id(), book.title(), book.format(), book.price(), cartLine.quantity());
    }

    private String newOrderNumber() {
        String date = LocalDate.now(SHOP_ZONE).format(DateTimeFormatter.BASIC_ISO_DATE);
        StringBuilder code = new StringBuilder(ORDER_CODE_LENGTH);
        for (int i = 0; i < ORDER_CODE_LENGTH; i++) {
            code.append(ORDER_CODE_CHARACTERS.charAt(RANDOM.nextInt(ORDER_CODE_CHARACTERS.length())));
        }
        return "BK-" + date + "-" + code;
    }

    public void startFulfilment(Long orderId) {
        findExisting(orderId).startFulfilment();
    }
}