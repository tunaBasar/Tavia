CREATE TABLE IF NOT EXISTS daily_sales (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          NOT NULL,
    total_revenue   NUMERIC(19,2) NOT NULL,
    total_orders    INTEGER       NOT NULL,
    report_date     DATE          NOT NULL,
    weather         VARCHAR(255),
    loyalty_level   VARCHAR(50),
    event_type      VARCHAR(255)
);
