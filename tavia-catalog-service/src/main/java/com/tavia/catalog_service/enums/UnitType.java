package com.tavia.catalog_service.enums;

/**
 * Unit of measurement for raw materials.
 * Mirrors the UnitType enum in tavia-inventory-service to ensure
 * recipe ingredients are expressed in units the inventory understands.
 *
 * Per GEMINI.md §3.2: No cross-service JPA relationships — we duplicate the enum.
 */
public enum UnitType {
    MILLILITER,
    GRAM,
    PIECE
}
