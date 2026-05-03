CREATE TABLE IF NOT EXISTS raw_materials (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID             NOT NULL,
    name            VARCHAR(255)     NOT NULL,
    unit            VARCHAR(50)      NOT NULL,
    stock_quantity  DOUBLE PRECISION NOT NULL,
    CONSTRAINT uq_tenant_material UNIQUE (tenant_id, name)
);
