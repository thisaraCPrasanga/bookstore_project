package com.thisara.bookstore.fulfilment.internal;

import com.thisara.bookstore.shared.ConflictException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "download_grants")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DownloadGrant {

    private static final int VALID_DAYS = 7;
    private static final short MAX_DOWNLOADS = 5;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private UUID token;

    @Column(nullable = false, updatable = false)
    private Long userId;

    @Column(nullable = false, updatable = false)
    private Long orderId;

    @Column(nullable = false, updatable = false)
    private Long orderItemId;

    @Column(nullable = false, updatable = false)
    private Long bookId;

    @Column(nullable = false, updatable = false)
    private Instant expiresAt;

    @Column(nullable = false, updatable = false)
    private short maxDownloads;

    @Column(nullable = false)
    private short downloadCount;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public DownloadGrant(Long userId, Long orderId, Long orderItemId, Long bookId, Instant now) {
        this.token = UUID.randomUUID();
        this.userId = Objects.requireNonNull(userId, "userId must not be null");
        this.orderId = Objects.requireNonNull(orderId, "orderId must not be null");
        this.orderItemId = Objects.requireNonNull(orderItemId, "orderItemId must not be null");
        this.bookId = Objects.requireNonNull(bookId, "bookId must not be null");
        this.expiresAt = Objects.requireNonNull(now, "now must not be null").plus(VALID_DAYS, ChronoUnit.DAYS);
        this.maxDownloads = MAX_DOWNLOADS;
    }

    public void recordDownload(Instant now) {
        if (now.isAfter(expiresAt)) {
            throw new ConflictException("This download link has expired.");
        }
        if (downloadCount >= maxDownloads) {
            throw new ConflictException("You have used all your downloads for this book.");
        }
        downloadCount++;
    }

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}