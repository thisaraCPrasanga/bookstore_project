package com.thisara.bookstore.catalog.internal;

import com.thisara.bookstore.catalog.Genre;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/books")
public class BookController {

    private final BookService bookService;

    BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookResponse> create(@Valid @RequestBody CreateBookRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookService.create(request));
    }

    @GetMapping
    public ResponseEntity<PagedModel<BookResponse>> getBooks(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Genre genre,
            @RequestParam(required = false) String author,
            @PageableDefault(size = 20, sort = "title") Pageable pageable) {
        return ResponseEntity.ok(new PagedModel<>(bookService.searchBooks(title, genre, author, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookResponse> getBook(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.findBook(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody UpdateBookRequest request) {
        return ResponseEntity.ok(bookService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> hide(@PathVariable Long id) {
        bookService.hideBook(id);
        return ResponseEntity.noContent().build();
    }
}