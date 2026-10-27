package com.thisara.bookstore.catalog.internal;

import com.thisara.bookstore.shared.ConflictException;
import com.thisara.bookstore.shared.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@Transactional(readOnly = true)
class BookService {

    private static final String CHANGED_BY_SOMEONE_ELSE =
            "This book was changed by someone else. Reload it and try again.";

    private final BookRepository bookRepository;

    BookService(BookRepository bookRepository){
        this.bookRepository=bookRepository;
    }

//    create a book
    @Transactional
    public BookResponse create (CreateBookRequest request){

        String isbn = Book.normalizeIsbn(request.isbn());

        if (bookRepository.existsByIsbn(isbn)){
            throw new ConflictException(duplicateIsbnMessage(isbn));
        }

        Book book = new Book(
                request.isbn(),request.title(),request.author(),
                request.genre(),request.publisher(),request.publishedYear(),
                request.description(),request.coverImageUrl(),request.format(),
                request.price(),request.stock(),request.fileKey()
        );
        return BookResponse.from(bookRepository.save(book));


    }

//    find all active books
    public Page<BookResponse> findActiveBooks(Pageable pageable){
        return bookRepository.findAllByActiveTrue(pageable)
                .map(BookResponse::from);
    }

//    find an active book
    public BookResponse findBook (Long id){
        return BookResponse.from(findActiveBook(id));
    }

//    hide the book
    @Transactional
    public void hideBook(Long id){
        findActiveBook(id).hide();
    }

//    update the book
    @Transactional
    public BookResponse updateBook(Long id,UpdateBookRequest request){

        Book book = findActiveBook(id);

        if (!Objects.equals(book.getVersion(),request.version())){
            throw new ConflictException(CHANGED_BY_SOMEONE_ELSE);
        }

        String isbn = Book.normalizeIsbn(request.isbn());
        if (bookRepository.existsByIsbnAndIdNot(isbn,id)){
            throw new ConflictException(duplicateIsbnMessage(isbn));
        }

        book.changeDetails(
                request.isbn(), request.title(), request.author(), request.genre(),
                request.publisher(), request.publishedYear(), request.description(),
                request.coverImageUrl(), request.price(), request.stock(), request.fileKey()
        );

        bookRepository.flush();
        return BookResponse.from(bookRepository.save(book));
    }


    public Book findActiveBook(Long id){
        return bookRepository.findByIdAndActiveTrue(id)
                .orElseThrow(()->new NotFoundException("Book not found"));
    }

    private static String duplicateIsbnMessage(String isbn) {
        return "A book with ISBN " + isbn + " already exists. It may be hidden.";
    }




}
