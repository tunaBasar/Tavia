-- V2: Add order lifecycle status and snapshot enrichment columns.
-- status defaults to 'PENDING' for both new and existing rows.

ALTER TABLE orders ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDING';
ALTER TABLE orders ADD COLUMN customer_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN loyalty_level VARCHAR(20);
