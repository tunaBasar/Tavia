CREATE TABLE IF NOT EXISTS orders (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     UUID,
    customer_id   UUID,
    product_name  VARCHAR(255),
    quantity      INTEGER,
    price         NUMERIC(19,2),
    order_date    TIMESTAMP WITHOUT TIME ZONE
);
