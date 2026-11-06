package com.thisara.bookstore.fulfilment.internal;

import org.springframework.core.io.Resource;

record EbookDownload(Resource file, String fileName) {
}