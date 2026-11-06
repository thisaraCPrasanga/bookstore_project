package com.thisara.bookstore.fulfilment.internal;

import com.thisara.bookstore.security.AuthenticatedUser;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/downloads")
@PreAuthorize("hasRole('CUSTOMER')")
class DownloadController {

    private final FulfilmentService fulfilmentService;

    DownloadController(FulfilmentService fulfilmentService) {
        this.fulfilmentService = fulfilmentService;
    }

    @GetMapping("/my")
    public ResponseEntity<List<DownloadResponse>> findMyDownloads(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(fulfilmentService.findMyDownloads(user.id()));
    }

    @GetMapping("/{token}")
    public ResponseEntity<Resource> download(
            @PathVariable UUID token,
            @AuthenticationPrincipal AuthenticatedUser user) {
        EbookDownload download = fulfilmentService.download(token, user.id());
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(download.fileName(), StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(download.file());
    }
}