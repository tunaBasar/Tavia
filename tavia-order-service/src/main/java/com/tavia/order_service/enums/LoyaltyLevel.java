package com.tavia.order_service.enums;

/**
 * Customer loyalty levels — mirrored from tavia-crm-service.
 * Used for type-safe serialization/deserialization of enriched order events.
 */
public enum LoyaltyLevel {
    BRONZE,
    SILVER,
    GOLD,
    PLATINUM,
    UNKNOWN
}
