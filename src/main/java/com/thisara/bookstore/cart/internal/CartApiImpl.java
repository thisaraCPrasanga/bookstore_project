package com.thisara.bookstore.cart.internal;

import com.thisara.bookstore.cart.CartApi;
import com.thisara.bookstore.cart.CartLine;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
class CartApiImpl implements CartApi {

    private final CartRepository cartRepository;

    CartApiImpl(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CartLine> findLines(Long userId) {
        return cartRepository.findByUserId(userId)
                .map(cart -> cart.getItems().stream()
                        .map(item -> new CartLine(item.getBookId(), item.getQuantity()))
                        .toList())
                .orElse(List.of());
    }

    @Override
    public void clear(Long userId) {
        cartRepository.findByUserId(userId).ifPresent(Cart::clear);
    }
}