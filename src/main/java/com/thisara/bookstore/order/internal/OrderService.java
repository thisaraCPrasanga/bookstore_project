package com.thisara.bookstore.order.internal;

import com.thisara.bookstore.cart.CartApi;
import com.thisara.bookstore.cart.CartLine;
import com.thisara.bookstore.catalog.BookSummary;
import com.thisara.bookstore.catalog.CatalogApi;
import com.thisara.bookstore.catalog.Format;
import com.thisara.bookstore.shared.BadRequestException;
import com.thisara.bookstore.shared.ConflictException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    private final OrderRepository orderRepository;
    private final CartApi cartApi;
    private final CatalogApi catalogApi;
    private final BigDecimal deliveryFee;

    OrderService(OrderRepository orderRepository,
                 CartApi cartApi,
                 CatalogApi catalogApi,
                 @Value("${app.order.delivery-fee}") BigDecimal deliveryFee) {
        this.orderRepository = orderRepository;
        this.cartApi = cartApi;
        this.catalogApi = catalogApi;
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
}