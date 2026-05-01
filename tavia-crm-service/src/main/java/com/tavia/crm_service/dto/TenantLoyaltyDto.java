package com.tavia.crm_service.dto;

import com.tavia.crm_service.entity.LoyaltyLevel;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO representing a customer's loyalty at a specific tenant.
 * Exposed via the profile/loyalties endpoint for the mobile app.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantLoyaltyDto {
    private UUID id;
    private UUID tenantId;
    private LoyaltyLevel loyaltyLevel;
    private BigDecimal totalSpent;
}
