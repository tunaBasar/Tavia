package com.tavia.inventory_service.enums;

/**
 * Unit of measurement for raw materials tracked in the inventory.
 * Aligned with the Tavia IoT-ready architecture — machines will report
 * consumption using these exact units.
 */
public enum UnitType {
    MILLILITER,
    GRAM,
    PIECE
}
