package com.thisara.bookstore.fulfilment.internal;

import org.springframework.core.io.Resource;

interface EbookStorage {

    Resource load(String fileKey);
}