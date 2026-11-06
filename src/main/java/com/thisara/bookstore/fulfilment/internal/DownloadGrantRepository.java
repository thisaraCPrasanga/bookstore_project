package com.thisara.bookstore.fulfilment.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

interface DownloadGrantRepository extends JpaRepository<DownloadGrant, Long> {

    Optional<DownloadGrant> findByToken(UUID token);

    List<DownloadGrant> findByUserIdOrderByCreatedAtDesc(Long userId);

}