package com.thisara.bookstore.catalog.internal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

interface BookRepository extends JpaRepository<Book,Long> , JpaSpecificationExecutor<Book> {
    boolean existsByIsbn(String isbn);
    boolean existsByIsbnAndIdNot(String isbn,Long id);
    Optional<Book> findByIdAndActiveTrue(Long id);
}
