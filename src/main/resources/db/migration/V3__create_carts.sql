CREATE TABLE carts (

    id         BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    BIGINT      NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_carts_user_id UNIQUE (user_id)
);

CREATE TABLE cart_items (
    id       BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cart_id  BIGINT      NOT NULL,
    book_id  BIGINT      NOT NULL,
    quantity INTEGER     NOT NULL,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE,
    CONSTRAINT uq_cart_items_cart_book UNIQUE (cart_id, book_id),
    CONSTRAINT ck_cart_items_quantity CHECK (quantity > 0)
);