package com.tavia.ai_service.enums;

/**
 * Customer loyalty levels — mirrored from tavia-crm-service.
 * Used for type-safe serialization/deserialization of order events.
 */
public enum LoyaltyLevel {
    BRONZE,
    SILVER,
    GOLD,
    PLATINUM,
    UNKNOWN
}
