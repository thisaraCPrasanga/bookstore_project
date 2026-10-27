package com.thisara.bookstore.catalog.internal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

interface BookRepository extends JpaRepository<Book,Long> {
    boolean existsByIsbn(String isbn);
    boolean existsByIsbnAndIdNot(String isbn,Long id);
    Optional<Book> findByIdAndActiveTrue(Long id);
    Page<Book> findAllByActiveTrue(Pageable pageable);
}
