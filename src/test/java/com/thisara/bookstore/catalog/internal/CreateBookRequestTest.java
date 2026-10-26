package com.thisara.bookstore.catalog.internal;

import com.thisara.bookstore.catalog.Format;
import com.thisara.bookstore.catalog.Genre;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.math.BigDecimal;
import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

class CreateBookRequestTest {

    private static final String VALID_ISBN = "9780132350884";
    private static final BigDecimal VALID_PRICE = new BigDecimal("2500.00");
    private static final String VALID_FILE_KEY = "clean-code.pdf";

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void createValidator() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void closeValidator() {
        factory.close();
    }

    private static CreateBookRequest request(String isbn, BigDecimal price, String fileKey) {
        return new CreateBookRequest(
                isbn, "Clean Code", "Robert C. Martin", Genre.PROGRAMMING,
                "Prentice Hall", (short) 2008, null, null,
                Format.EBOOK, price, null, fileKey);
    }

    private static Set<String> invalidFields(CreateBookRequest request) {
        return validator.validate(request).stream()
                .map(violation -> violation.getPropertyPath().toString())
                .collect(Collectors.toSet());
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "9780132350884", "978-0-13-235088-4", "978 0 13 235088 4", "0132350882", "0-8044-2957-X"})
    void acceptsIsbnWithOrWithoutHyphensAndSpaces(String isbn) {
        assertThat(invalidFields(request(isbn, VALID_PRICE, VALID_FILE_KEY))).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "12345", "97801323508841", "978-0-13-235088-", "abcdefghij", "978--0-13-235088-4"})
    void rejectsWrongIsbn(String isbn) {
        assertThat(invalidFields(request(isbn, VALID_PRICE, VALID_FILE_KEY))).containsExactly("isbn");
    }

    @ParameterizedTest
    @ValueSource(strings = {"../secret.pdf", "books/clean-code.pdf", "..\\secret.pdf", ".hidden.pdf"})
    void rejectsFileKeyThatCouldLeaveTheFolder(String fileKey) {
        assertThat(invalidFields(request(VALID_ISBN, VALID_PRICE, fileKey))).containsExactly("fileKey");
    }

    @Test
    void rejectsPriceWithThreeDecimals() {
        assertThat(invalidFields(request(VALID_ISBN, new BigDecimal("1500.005"), VALID_FILE_KEY)))
                .containsExactly("price");
    }
}