package com.thisara.bookstore.fulfilment.internal;

import com.thisara.bookstore.catalog.BookSummary;

import java.time.Instant;
import java.util.UUID;

public record DownloadResponse(
        UUID token,
        Long bookId,
        String bookTitle,
        Instant expiresAt,
        int downloadsLeft
) {

    static DownloadResponse from(DownloadGrant grant, BookSummary book) {
        return new DownloadResponse(
                grant.getToken(),
                grant.getBookId(),
                book.title(),
                grant.getExpiresAt(),
                grant.getDownloadsLeft());
    }
}