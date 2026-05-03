CREATE TABLE IF NOT EXISTS customers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255) NOT NULL,
    email               VARCHAR(255) NOT NULL UNIQUE,
    city                VARCHAR(50)  NOT NULL,
    password_hash       VARCHAR(255),
    reset_token         VARCHAR(255),
    reset_token_expiry  TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS tenant_loyalty (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID           NOT NULL,
    tenant_id       UUID           NOT NULL,
    loyalty_level   VARCHAR(50)    NOT NULL DEFAULT 'BRONZE',
    total_spent     NUMERIC(19,2)  NOT NULL DEFAULT 0,
    CONSTRAINT uq_customer_tenant UNIQUE (customer_id, tenant_id)
);
