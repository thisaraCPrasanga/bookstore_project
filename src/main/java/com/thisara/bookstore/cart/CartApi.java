package com.thisara.bookstore.cart;

import java.util.List;

public interface CartApi {

    List<CartLine> findLines(Long userId);

    void clear(Long userId);
}