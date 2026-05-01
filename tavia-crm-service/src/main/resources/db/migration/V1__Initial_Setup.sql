-- UUID uzantısını aktifleştir (id'ler için gerekli olabilir)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. GLOBAL CUSTOMER TABLOSU
CREATE TABLE customers (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    city VARCHAR(50),
    password_hash VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    
    -- Müşteri emaili globalde tekildir (Clean Architecture kuralımız)
    CONSTRAINT uk_customer_email UNIQUE (email)
);

-- 2. TENANT_LOYALTY TABLOSU (Tertemiz isimlendirmeyle)
CREATE TABLE tenant_loyalty (
    id UUID PRIMARY KEY,
    customer_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    loyalty_level VARCHAR(50) NOT NULL,
    total_spent NUMERIC(19,2) NOT NULL DEFAULT 0,
    
    -- İlişki (Foreign Key)
    CONSTRAINT fk_loyalty_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    
    -- Bir müşterinin bir işletmede tek bir sadakat kaydı olabilir
    CONSTRAINT uk_tenant_loyalty_customer_tenant UNIQUE (customer_id, tenant_id)
);