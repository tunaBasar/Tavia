CREATE TABLE IF NOT EXISTS recipes (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     UUID         NOT NULL,
    product_name  VARCHAR(255) NOT NULL,
    display_name  VARCHAR(255) NOT NULL,
    category      VARCHAR(50)  NOT NULL,
    description   VARCHAR(500),
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_tenant_product UNIQUE (tenant_id, product_name)
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_material_name VARCHAR(255)     NOT NULL,
    quantity          DOUBLE PRECISION NOT NULL,
    unit              VARCHAR(50)      NOT NULL,
    recipe_id         UUID             NOT NULL,
    CONSTRAINT fk_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);
