package com.tavia.order_service.kafka;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
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
    private String customerLevel;
    private BigDecimal totalSpent;

    // Enrichment fields from Context
    private String weather;
    private String activeEvent;
    private String competitorIntensity;
}
