-- Patch existing recipes with realistic prices based on category and product
-- Per SRS: prices in TRY (Turkish Lira), aligned with 2026 cafe market

UPDATE recipes SET price = CASE product_name
    -- ESPRESSO_BASED
    WHEN 'ESPRESSO'          THEN 45.00
    WHEN 'LATTE'             THEN 65.00
    WHEN 'AMERICANO'         THEN 50.00
    WHEN 'CAPPUCCINO'        THEN 65.00
    WHEN 'MOCHA'             THEN 75.00
    WHEN 'FLAT_WHITE'        THEN 70.00
    WHEN 'CARAMEL_MACCHIATO' THEN 80.00
    WHEN 'HAZELNUT_LATTE'    THEN 78.00
    -- TEA
    WHEN 'TURKISH_TEA'       THEN 25.00
    WHEN 'GREEN_TEA'         THEN 30.00
    WHEN 'SAHLEP'            THEN 40.00
    -- COLD_BEVERAGE
    WHEN 'ICED_COFFEE'       THEN 60.00
    WHEN 'FRAPPE'            THEN 72.00
    WHEN 'ICED_MOCHA'        THEN 78.00
    -- FOOD
    WHEN 'TOST'              THEN 55.00
    WHEN 'POGACA'            THEN 35.00
    -- DESSERT
    WHEN 'BROWNIE'           THEN 50.00
    WHEN 'COOKIE'            THEN 38.00
    ELSE CASE category
        WHEN 'ESPRESSO_BASED' THEN 65.00
        WHEN 'TEA'            THEN 30.00
        WHEN 'COLD_BEVERAGE'  THEN 65.00
        WHEN 'FOOD'           THEN 45.00
        WHEN 'DESSERT'        THEN 42.00
        ELSE 50.00
    END
END
WHERE price = 0.00 OR price IS NULL;

-- Enforce NOT NULL now that all records have meaningful prices
ALTER TABLE recipes ALTER COLUMN price SET NOT NULL;
