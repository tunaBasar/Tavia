package com.tavia.order_service.kafka;

import com.tavia.order_service.enums.LoyaltyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderEvent {
    private UUID orderId;
    private UUID tenantId;
    private String productName;
    private Double quantity;
    private BigDecimal price;

    // Enrichment fields from CRM
    private LoyaltyLevel customerLevel;
    private BigDecimal totalSpent;

    // Enrichment fields from Context
    private String weather;
    private String activeEvent;
    private String competitorIntensity;

    // Recipe-resolved raw material deductions for inventory-service consumer
    private List<RawMaterialDeduction> deductions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RawMaterialDeduction {
        private String rawMaterialName;
        private Double quantity;
        private String unit;
    }
}
