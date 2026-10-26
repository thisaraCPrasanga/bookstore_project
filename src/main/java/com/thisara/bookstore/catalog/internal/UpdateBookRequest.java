package com.thisara.bookstore.catalog.internal;

import com.thisara.bookstore.catalog.Genre;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateBookRequest(

        @NotBlank
        @Pattern(regexp = BookPatterns.ISBN, message = BookPatterns.ISBN_MESSAGE)
        String isbn,

        @NotBlank
        @Size(max = 255)
        String title,

        @NotBlank
        @Size(max = 255)
        String author,

        @NotNull
        Genre genre,

        @Size(max = 255)
        String publisher,

        @Positive
        @Max(2100)
        Short publishedYear,

        @Size(max = 5000)
        String description,

        @Size(max = 500)
        @Pattern(regexp = BookPatterns.HTTPS_URL, message = BookPatterns.HTTPS_URL_MESSAGE)
        String coverImageUrl,

        @NotNull
        @DecimalMin("0.00")
        @Digits(integer = 8, fraction = 2)
        BigDecimal price,

        @PositiveOrZero
        Integer stock,

        @Size(max = 255)
        @Pattern(regexp = BookPatterns.FILE_KEY, message = BookPatterns.FILE_KEY_MESSAGE)
        String fileKey,

        @NotNull
        Long version
) {
}