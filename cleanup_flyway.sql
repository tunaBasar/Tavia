-- TAVIA V2: Clean Flyway State After Volume Wipe
-- Run this ONCE before starting services to clear stale baseline markers.

DROP TABLE IF EXISTS flyway_schema_history CASCADE;
DROP TABLE IF EXISTS flyway_schema_history_ai CASCADE;
DROP TABLE IF EXISTS flyway_schema_history_catalog CASCADE;
DROP TABLE IF EXISTS flyway_schema_history_crm CASCADE;
DROP TABLE IF EXISTS flyway_schema_history_inventory CASCADE;
DROP TABLE IF EXISTS flyway_schema_history_iot CASCADE;
DROP TABLE IF EXISTS flyway_schema_history_order CASCADE;
DROP TABLE IF EXISTS flyway_schema_history_tenant CASCADE;

-- Also drop any domain tables that may have been partially created
DROP TABLE IF EXISTS tenant_loyalty CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS daily_sales CASCADE;
DROP TABLE IF EXISTS recipe_ingredients CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS raw_materials CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS machine_telemetry CASCADE;
DROP TABLE IF EXISTS machine_tasks CASCADE;
DROP TABLE IF EXISTS machines CASCADE;
