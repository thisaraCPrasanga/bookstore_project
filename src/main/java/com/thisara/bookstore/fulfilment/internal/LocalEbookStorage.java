package com.thisara.bookstore.fulfilment.internal;

import com.thisara.bookstore.shared.NotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;

@Component
class LocalEbookStorage implements EbookStorage {

    private final Path folder;

    LocalEbookStorage(@Value("${app.ebooks.folder}") String folder) {
        this.folder = Path.of(folder).toAbsolutePath().normalize();
    }

    @Override
    public Resource load(String fileKey) {
        Path file = folder.resolve(fileKey).normalize();
        if (!file.startsWith(folder) || !Files.isRegularFile(file)) {
            throw new NotFoundException("The ebook file was not found.");
        }
        return new FileSystemResource(file);
    }
}