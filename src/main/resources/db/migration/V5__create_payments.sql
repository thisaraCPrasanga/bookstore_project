CREATE TABLE payment_transactions (
                                      id                   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                      order_id             BIGINT        NOT NULL,
                                      order_number         VARCHAR(30)   NOT NULL,
                                      amount               NUMERIC(12,2) NOT NULL,
                                      currency             VARCHAR(3)    NOT NULL,
                                      status               VARCHAR(20)   NOT NULL,
                                      payhere_payment_id   VARCHAR(50),
                                      payhere_status_code  SMALLINT,
                                      payment_method       VARCHAR(20),
                                      status_message       VARCHAR(255),
                                      created_at           TIMESTAMPTZ   NOT NULL DEFAULT now(),
                                      updated_at           TIMESTAMPTZ   NOT NULL DEFAULT now(),

                                      CONSTRAINT uq_payment_transactions_payhere_payment_id UNIQUE (payhere_payment_id),
                                      CONSTRAINT ck_payment_transactions_status CHECK (status IN (
                                                                                                  'INITIATED', 'PENDING', 'SUCCESS', 'CANCELLED', 'FAILED', 'CHARGEDBACK'
                                          ))
);

CREATE INDEX idx_payment_transactions_order_id ON payment_transactions (order_id);
CREATE INDEX idx_payment_transactions_order_number ON payment_transactions (order_number);

CREATE UNIQUE INDEX uq_payment_transactions_one_success ON payment_transactions (order_id) WHERE status = 'SUCCESS';