CREATE TABLE download_grants (
                                 id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                 token           UUID        NOT NULL,
                                 user_id         BIGINT      NOT NULL,
                                 order_id        BIGINT      NOT NULL,
                                 order_item_id   BIGINT      NOT NULL,
                                 book_id         BIGINT      NOT NULL,
                                 expires_at      TIMESTAMPTZ NOT NULL,
                                 max_downloads   SMALLINT    NOT NULL DEFAULT 5,
                                 download_count  SMALLINT    NOT NULL DEFAULT 0,
                                 created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

                                 CONSTRAINT uq_download_grants_token UNIQUE (token),
                                 CONSTRAINT uq_download_grants_order_item_id UNIQUE (order_item_id),
                                 CONSTRAINT ck_download_grants_download_count CHECK (download_count <= max_downloads)
);

CREATE INDEX idx_download_grants_user_id ON download_grants (user_id);

CREATE TABLE shipments (
                           id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                           order_id         BIGINT       NOT NULL,
                           user_id          BIGINT       NOT NULL,
                           full_name        VARCHAR(200) NOT NULL,
                           phone            VARCHAR(20)  NOT NULL,
                           address_line1    VARCHAR(255) NOT NULL,
                           address_line2    VARCHAR(255),
                           city             VARCHAR(100) NOT NULL,
                           postal_code      VARCHAR(20),
                           status           VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
                           tracking_number  VARCHAR(50),
                           shipped_at       TIMESTAMPTZ,
                           delivered_at     TIMESTAMPTZ,
                           created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
                           updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),

                           CONSTRAINT uq_shipments_order_id UNIQUE (order_id),
                           CONSTRAINT ck_shipments_status CHECK (status IN ('PENDING', 'SHIPPED', 'DELIVERED'))
);

CREATE INDEX idx_shipments_status ON shipments (status);