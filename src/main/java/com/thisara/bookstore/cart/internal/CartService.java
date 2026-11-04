package com.thisara.bookstore.cart.internal;

import com.thisara.bookstore.catalog.BookSummary;
import com.thisara.bookstore.catalog.CatalogApi;
import com.thisara.bookstore.catalog.Format;
import com.thisara.bookstore.shared.ConflictException;
import com.thisara.bookstore.shared.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@Transactional
class CartService {

    private static final BigDecimal ZERO = new BigDecimal("0.00");

    private final CartRepository cartRepository;
    private final CatalogApi catalogApi;

    CartService(CartRepository cartRepository, CatalogApi catalogApi) {
        this.cartRepository = cartRepository;
        this.catalogApi = catalogApi;
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .map(this::toResponse)
                .orElseGet(CartService::emptyCart);
    }

    public CartResponse addItem(Long userId, AddCartItemRequest request) {
        BookSummary book = findSellableBook(request.bookId());
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(new Cart(userId)));
        cart.addItem(book.id(), request.quantity(), maxQuantity(book));
        return toResponse(cart);
    }

    public CartResponse changeQuantity(Long userId, Long bookId, ChangeQuantityRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("This book is not in your cart."));
        BookSummary book = findSellableBook(bookId);
        cart.changeQuantity(bookId, request.quantity(), maxQuantity(book));
        return toResponse(cart);
    }

    public void removeItem(Long userId, Long bookId) {
        cartRepository.findByUserId(userId).ifPresent(cart -> cart.removeItem(bookId));
    }

    public void clear(Long userId) {
        cartRepository.findByUserId(userId).ifPresent(Cart::clear);
    }

    private BookSummary findSellableBook(Long bookId) {
        BookSummary book = catalogApi.findBook(bookId)
                .orElseThrow(() -> new NotFoundException("Book not found."));
        if (!book.active()) {
            throw new ConflictException("'" + book.title() + "' is no longer sold.");
        }
        return book;
    }

    private static int maxQuantity(BookSummary book) {
        if (book.format() == Format.EBOOK) {
            return 1;
        }
        if (book.stock() == 0) {
            throw new ConflictException("'" + book.title() + "' is out of stock.");
        }
        return book.stock();
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItem> items = cart.getItems();
        Map<Long, BookSummary> books = catalogApi.findBooks(
                items.stream().map(CartItem::getBookId).toList());

        List<CartItemResponse> lines = items.stream()
                .map(item -> toLine(item, books.get(item.getBookId())))
                .toList();

        int totalQuantity = lines.stream().mapToInt(CartItemResponse::quantity).sum();
        BigDecimal subtotal = lines.stream()
                .map(CartItemResponse::lineTotal)
                .reduce(ZERO, BigDecimal::add);
        return new CartResponse(lines, totalQuantity, subtotal);
    }

    private static CartItemResponse toLine(CartItem item, BookSummary book) {
        BigDecimal lineTotal = book.price().multiply(BigDecimal.valueOf(item.getQuantity()));
        boolean available = book.active()
                && (book.format() == Format.EBOOK || book.stock() >= item.getQuantity());
        return new CartItemResponse(book.id(), book.title(), book.author(), book.format(),
                book.price(), item.getQuantity(), lineTotal, available);
    }

    private static CartResponse emptyCart() {
        return new CartResponse(List.of(), 0, ZERO);
    }
}