package com.thisara.bookstore.catalog.internal;

import com.thisara.bookstore.catalog.BookSummary;
import com.thisara.bookstore.catalog.CatalogApi;
import com.thisara.bookstore.shared.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
class CatalogApiImpl implements CatalogApi {

    private final BookRepository bookRepository;

    CatalogApiImpl(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<BookSummary> findBook(Long bookId){
        return bookRepository.findById(bookId).map(CatalogApiImpl::toBookSummary);
    }

    @Override
    public void reduceStock(Long bookId,int quantity){
        findExistingBook(bookId).reduceStock(quantity);
    }

    @Override
    public void returnStock(Long bookId, int quantity){
        findExistingBook(bookId).returnStock(quantity);
    }

    private Book findExistingBook(Long bookId){
        return bookRepository.findById(bookId).orElseThrow(()->new NotFoundException("Book not found"));
    }

    private static BookSummary toBookSummary(Book book){
        return new BookSummary(
                book.getId(),book.getTitle(),book.getAuthor(),book.getFormat(),book.getPrice(),book.getStock(),book.isActive(),book.getFileKey()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, BookSummary> findBooks(Collection<Long> bookIds) {
        return bookRepository.findAllById(bookIds).stream()
                .map(CatalogApiImpl::toBookSummary)
                .collect(Collectors.toMap(BookSummary::id, Function.identity()));
    }


}
