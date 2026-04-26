package com.tavia.ai_service.dto;

import com.tavia.ai_service.enums.LoyaltyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailySalesDto {
    private UUID id;
    private UUID tenantId;
    private BigDecimal totalRevenue;
    private Integer totalOrders;
    private LocalDate reportDate;

    // New enrichment fields
    private String weather;
    private LoyaltyLevel loyaltyLevel;
    private String eventType;
}
