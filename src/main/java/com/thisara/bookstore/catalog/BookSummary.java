package com.thisara.bookstore.catalog;

import java.math.BigDecimal;

public record BookSummary(
        Long id,
        String title,
        String author,
        Format format,
        BigDecimal price,
        Integer stock,
        boolean active,
        String fileKey
) {
}
