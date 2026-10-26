package com.thisara.bookstore.catalog.internal;

import com.thisara.bookstore.catalog.Format;
import com.thisara.bookstore.catalog.Genre;
import com.thisara.bookstore.shared.BadRequestException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BookTest {

    private static Book ebook(Integer stock, String fileKey) {
        return new Book("978-0-13-235088-4", "  Clean Code ", "Robert C. Martin", Genre.PROGRAMMING,
                "   ", (short) 2008, "", null,
                Format.EBOOK, new BigDecimal("2500"), stock, fileKey);
    }

    private static Book printedBook(Integer stock, String fileKey) {
        return new Book("9780132350884", "Clean Code", "Robert C. Martin", Genre.PROGRAMMING,
                "Prentice Hall", (short) 2008, null, null,
                Format.PHYSICAL, new BigDecimal("4500.00"), stock, fileKey);
    }

    @Test
    void newBookIsCleanedAndVisible() {
        Book book = ebook(null, "clean-code.pdf");

        assertThat(book.getIsbn()).isEqualTo("9780132350884");
        assertThat(book.getTitle()).isEqualTo("Clean Code");
        assertThat(book.getPublisher()).isNull();
        assertThat(book.getDescription()).isNull();
        assertThat(book.getPrice()).isEqualTo(new BigDecimal("2500.00"));
        assertThat(book.isActive()).isTrue();
        assertThat(book.isDescriptionByAi()).isFalse();
    }

    @Test
    void isbn10WithSmallXIsSavedWithCapitalX() {
        assertThat(Book.normalizeIsbn("0-8044-2957-x")).isEqualTo("080442957X");
    }

    @Test
    void ebookCannotHaveStock() {
        assertThatThrownBy(() -> ebook(3, "clean-code.pdf"))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("An ebook has no stock. Leave the stock empty.");
    }

    @Test
    void printedBookNeedsStock() {
        assertThatThrownBy(() -> printedBook(null, null))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("A printed book needs a stock number.");
    }

    @Test
    void printedBookCannotHaveFile() {
        assertThatThrownBy(() -> printedBook(5, "clean-code.pdf"))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Only an ebook can have a file.");
    }

    @Test
    void failedChangeLeavesTheBookAsItWas() {
        Book book = ebook(null, "clean-code.pdf");

        assertThatThrownBy(() -> book.changeDetails(
                "9780132350884", "New Title", "Robert C. Martin", Genre.PROGRAMMING,
                null, (short) 2008, null, null,
                new BigDecimal("2500.00"), 10, "clean-code.pdf"))
                .isInstanceOf(BadRequestException.class);

        assertThat(book.getTitle()).isEqualTo("Clean Code");
        assertThat(book.getStock()).isNull();
    }

    @Test
    void hideMakesTheBookInactive() {
        Book book = printedBook(5, null);

        book.hide();

        assertThat(book.isActive()).isFalse();
    }
}