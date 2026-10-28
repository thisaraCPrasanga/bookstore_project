package com.thisara.bookstore.catalog.internal;

import com.thisara.bookstore.catalog.Genre;
import com.thisara.bookstore.shared.BadRequestException;
import com.thisara.bookstore.shared.ConflictException;
import com.thisara.bookstore.shared.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@Transactional(readOnly = true)
class BookService {

    private static final String CHANGED_BY_SOMEONE_ELSE =
            "This book was changed by someone else. Reload it and try again.";

    private static final List<String> SORTABLE_FIELDS =
            List.of("title", "author", "price", "publishedYear", "createdAt");

    private final BookRepository bookRepository;

    BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @Transactional
    public BookResponse create(CreateBookRequest request) {
        String isbn = Book.normalizeIsbn(request.isbn());
        if (bookRepository.existsByIsbn(isbn)) {
            throw new ConflictException(duplicateIsbnMessage(isbn));
        }

        Book book = new Book(
                request.isbn(), request.title(), request.author(), request.genre(),
                request.publisher(), request.publishedYear(), request.description(),
                request.coverImageUrl(), request.format(), request.price(),
                request.stock(), request.fileKey());

        return BookResponse.from(bookRepository.save(book));
    }

    @Transactional
    public BookResponse update(Long id, UpdateBookRequest request) {
        Book book = findActiveBook(id);
        if (!Objects.equals(book.getVersion(), request.version())) {
            throw new ConflictException(CHANGED_BY_SOMEONE_ELSE);
        }

        String isbn = Book.normalizeIsbn(request.isbn());
        if (bookRepository.existsByIsbnAndIdNot(isbn, id)) {
            throw new ConflictException(duplicateIsbnMessage(isbn));
        }

        book.changeDetails(
                request.isbn(), request.title(), request.author(), request.genre(),
                request.publisher(), request.publishedYear(), request.description(),
                request.coverImageUrl(), request.price(), request.stock(), request.fileKey());

        bookRepository.flush();
        return BookResponse.from(book);
    }

    @Transactional
    public void hideBook(Long id) {
        findActiveBook(id).hide();
    }

    public BookResponse findBook(Long id) {
        return BookResponse.from(findActiveBook(id));
    }

    public Page<BookResponse> searchBooks(String title, Genre genre, String author, Pageable pageable) {
        checkSortFields(pageable.getSort());
        return bookRepository.findAll(BookSpecifications.search(title, genre, author), pageable)
                .map(BookResponse::from);
    }

    private Book findActiveBook(Long id) {
        return bookRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new NotFoundException("Book not found"));
    }

    private static String duplicateIsbnMessage(String isbn) {
        return "A book with ISBN " + isbn + " already exists. It may be hidden.";
    }

    private static void checkSortFields(Sort sort) {
        for (Sort.Order order : sort) {
            if (!SORTABLE_FIELDS.contains(order.getProperty())) {
                throw new BadRequestException("You cannot sort by '" + order.getProperty()
                        + "'. You can sort by: " + String.join(", ", SORTABLE_FIELDS) + ".");
            }
        }
    }
}