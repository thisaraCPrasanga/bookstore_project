package com.thisara.bookstore.catalog.internal;

import com.thisara.bookstore.catalog.Format;
import com.thisara.bookstore.catalog.Genre;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "books")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false,length = 13)
    private String isbn;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false,length = 50)
    private Genre genre;

    private String publisher;

    private Short publishedYear;

    private String description;

    @Column(nullable = false)
    private boolean descriptionByAi;

    @Column(length = 500)
    private String coverImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Format format;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    private Integer stock;

    private String fileKey;

    @Column(nullable = false)
    private boolean active = true;

    @Version
    private Long version;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

}
