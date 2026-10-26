package com.thisara.bookstore.catalog.internal;

final class BookPatterns {

    static final String ISBN = "(\\d[- ]?){9}[\\dXx]|(\\d[- ]?){12}\\d";
    static final String ISBN_MESSAGE = "must be an ISBN-10 or ISBN-13 hyphens and spaces are allowed";

    static final String HTTPS_URL = "https://\\S+";
    static final String HTTPS_URL_MESSAGE = "must start with https:// and contain no spaces";

    static final String FILE_KEY = "[A-Za-z0-9_-][A-Za-z0-9._-]*";
    static final String FILE_KEY_MESSAGE =
            "may contain only letters, digits, dots, hyphens and underscores and must not start with a dot";

    private BookPatterns() {
    }
}