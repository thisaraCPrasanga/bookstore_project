package com.thisara.bookstore.catalog.internal;

import com.thisara.bookstore.catalog.Format;
import com.thisara.bookstore.catalog.Genre;
import com.thisara.bookstore.shared.BadRequestException;
import com.thisara.bookstore.shared.ConflictException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Locale;
import java.util.Objects;

@Entity
@Table(name = "books")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 13)
    private String isbn;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
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
    private boolean active;

    @Version
    private Long version;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    public Book(String isbn, String title, String author, Genre genre, String publisher,
                Short publishedYear, String description, String coverImageUrl,
                Format format, BigDecimal price, Integer stock, String fileKey) {
        this.format = Objects.requireNonNull(format, "format must not be null");
        this.active = true;
        this.descriptionByAi = false;
        setDetails(isbn, title, author, genre, publisher, publishedYear,
                description, coverImageUrl, price, stock, fileKey);
    }

    public void changeDetails(String isbn, String title, String author, Genre genre, String publisher,
                              Short publishedYear, String description, String coverImageUrl,
                              BigDecimal price, Integer stock, String fileKey) {
        setDetails(isbn, title, author, genre, publisher, publishedYear,
                description, coverImageUrl, price, stock, fileKey);
    }

    public void hide() {
        this.active = false;
    }

    static String normalizeIsbn(String isbn) {
        return isbn.replace("-", "").replace(" ", "").toUpperCase(Locale.ROOT);
    }

    private void setDetails(String isbn, String title, String author, Genre genre, String publisher,
                            Short publishedYear, String description, String coverImageUrl,
                            BigDecimal price, Integer stock, String fileKey) {
        String cleanFileKey = blankToNull(fileKey);
        checkStockAndFile(stock, cleanFileKey);

        this.isbn = normalizeIsbn(isbn);
        this.title = title.trim();
        this.author = author.trim();
        this.genre = Objects.requireNonNull(genre, "genre must not be null");
        this.publisher = blankToNull(publisher);
        this.publishedYear = publishedYear;
        this.description = blankToNull(description);
        this.coverImageUrl = blankToNull(coverImageUrl);
        this.price = Objects.requireNonNull(price, "price must not be null")
                .setScale(2, RoundingMode.UNNECESSARY);
        this.stock = stock;
        this.fileKey = cleanFileKey;
    }

    private void checkStockAndFile(Integer stock, String fileKey) {
        if (format == Format.EBOOK && stock != null) {
            throw new BadRequestException("An ebook has no stock. Leave the stock empty.");
        }
        if (format == Format.PHYSICAL && stock == null) {
            throw new BadRequestException("A printed book needs a stock number.");
        }
        if (format == Format.PHYSICAL && fileKey != null) {
            throw new BadRequestException("Only an ebook can have a file.");
        }
    }

    private static String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }

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

// reduce book
    public void reduceBook (int quantity) {

        checkQuantity(quantity);

        if (!active){
            throw new ConflictException("'" + title + "' is no longer sold.");
        }
        if (format == Format.EBOOK) {
            return;
        }
        if (quantity > stock){
            throw new ConflictException("Not enough stock for '" + title + "'. Only " + stock + " left.");
        }
        stock -= quantity;
    }

//    return book
    public void returnBook(int quantity){
        checkQuantity(quantity);
        if (format == Format.PHYSICAL){
            stock = stock + quantity;
        }
    }

//    checkQuantity function
    private  static void checkQuantity(int quantity){
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero, but was " + quantity);
        }
    }
}