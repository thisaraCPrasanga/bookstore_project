CREATE TABLE orders (
                        id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                        order_number    VARCHAR(30)   NOT NULL,
                        user_id         BIGINT        NOT NULL,
                        customer_email  VARCHAR(255)  NOT NULL,
                        status          VARCHAR(20)   NOT NULL,
                        subtotal        NUMERIC(12,2) NOT NULL,
                        delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
                        total_amount    NUMERIC(12,2) NOT NULL,
                        currency        VARCHAR(3)    NOT NULL DEFAULT 'LKR',
                        full_name       VARCHAR(200)  NOT NULL,
                        phone           VARCHAR(20)   NOT NULL,
                        address_line1   VARCHAR(255)  NOT NULL,
                        address_line2   VARCHAR(255),
                        city            VARCHAR(100)  NOT NULL,
                        postal_code     VARCHAR(20),
                        country         VARCHAR(60)   NOT NULL DEFAULT 'Sri Lanka',
                        paid_at         TIMESTAMPTZ,
                        version         BIGINT        NOT NULL DEFAULT 0,
                        created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
                        updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),

                        CONSTRAINT uq_orders_order_number UNIQUE (order_number),
                        CONSTRAINT ck_orders_status CHECK (status IN (
                                                                      'PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'
                            )),
                        CONSTRAINT ck_orders_subtotal CHECK (subtotal >= 0),
                        CONSTRAINT ck_orders_delivery_fee CHECK (delivery_fee >= 0),
                        CONSTRAINT ck_orders_total_amount CHECK (total_amount = subtotal + delivery_fee)
);

CREATE INDEX idx_orders_user_id ON orders (user_id);
CREATE INDEX idx_orders_status_created_at ON orders (status, created_at);

CREATE TABLE order_items (
                             id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                             order_id           BIGINT        NOT NULL,
                             book_id            BIGINT        NOT NULL,
                             book_title         VARCHAR(255)  NOT NULL,
                             book_format        VARCHAR(10)   NOT NULL,
                             unit_price         NUMERIC(10,2) NOT NULL,
                             quantity           INTEGER       NOT NULL,
                             line_total         NUMERIC(12,2) NOT NULL,
                             fulfilment_status  VARCHAR(20)   NOT NULL DEFAULT 'PENDING',

                             CONSTRAINT fk_order_items_order FOREIGN KEY (order_id)
                                 REFERENCES orders (id) ON DELETE CASCADE,
                             CONSTRAINT uq_order_items_order_book UNIQUE (order_id, book_id),
                             CONSTRAINT ck_order_items_book_format CHECK (book_format IN ('EBOOK', 'PHYSICAL')),
                             CONSTRAINT ck_order_items_quantity CHECK (quantity > 0),
                             CONSTRAINT ck_order_items_fulfilment_status CHECK (fulfilment_status IN (
                                                                                                      'PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'
                                 ))
);

CREATE TABLE order_status_history (
                                      id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                      order_id     BIGINT       NOT NULL,
                                      from_status  VARCHAR(20),
                                      to_status    VARCHAR(20)  NOT NULL,
                                      changed_by   VARCHAR(255) NOT NULL,
                                      note         VARCHAR(255),
                                      changed_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),

                                      CONSTRAINT fk_order_status_history_order FOREIGN KEY (order_id)
                                          REFERENCES orders (id) ON DELETE CASCADE
);

CREATE INDEX idx_order_status_history_order_id ON order_status_history (order_id);