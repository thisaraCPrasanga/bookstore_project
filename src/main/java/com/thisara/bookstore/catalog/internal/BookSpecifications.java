package com.thisara.bookstore.catalog.internal;

import com.thisara.bookstore.catalog.Genre;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

final class BookSpecifications {

    private BookSpecifications() {
    }

    static Specification<Book> search(String title, Genre genre, String author) {
        Specification<Book> spec = isActive();
        if (title != null && !title.isBlank()) {
            spec = spec.and(contains("title", title));
        }
        if (genre != null) {
            spec = spec.and(hasGenre(genre));
        }
        if (author != null && !author.isBlank()) {
            spec = spec.and(contains("author", author));
        }
        return spec;
    }

    private static Specification<Book> isActive() {
        return (root, query, cb) -> cb.isTrue(root.get("active"));
    }

    private static Specification<Book> hasGenre(Genre genre) {
        return (root, query, cb) -> cb.equal(root.get("genre"), genre);
    }

    private static Specification<Book> contains(String field, String text) {
        String pattern = "%" + text.trim().toLowerCase(Locale.ROOT) + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get(field)), pattern);
    }
}