CREATE TABLE books
(
                       id                BIGINT        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                       isbn              VARCHAR(13)   NOT NULL,
                       title             VARCHAR(255)  NOT NULL,
                       author            VARCHAR(255)  NOT NULL,
                       genre             VARCHAR(50)   NOT NULL,
                       publisher         VARCHAR(255),
                       published_year    SMALLINT,
                       description       TEXT,
                       description_by_ai BOOLEAN       NOT NULL DEFAULT FALSE,
                       cover_image_url   VARCHAR(500),
                       format            VARCHAR(10)   NOT NULL,
                       price             NUMERIC(10,2) NOT NULL,
                       stock             INTEGER,
                       file_key          VARCHAR(255),
                       active            BOOLEAN       NOT NULL DEFAULT TRUE,
                       version           BIGINT        NOT NULL DEFAULT 0,
                       created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
                       updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),

                       CONSTRAINT uq_books_isbn
                           UNIQUE (isbn),
                       CONSTRAINT ck_books_published_year
                           CHECK (published_year > 0),
                       CONSTRAINT ck_books_format
                           CHECK (format IN ('EBOOK', 'PHYSICAL')),
                       CONSTRAINT ck_books_price
                           CHECK (price >= 0),
                       CONSTRAINT ck_books_stock_by_format
                           CHECK ((format = 'EBOOK' AND stock IS NULL)
                               OR (format = 'PHYSICAL' AND stock IS NOT NULL AND stock >= 0)),
                       CONSTRAINT ck_books_file_key_ebook_only
                           CHECK (format = 'EBOOK' OR file_key IS NULL)
);

CREATE INDEX idx_books_genre  ON books (genre);
CREATE INDEX idx_books_author ON books (author);