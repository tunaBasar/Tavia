package com.tavia.ai_service.dto;

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
public class OrderEventDto {
    private UUID id;
    private UUID orderId;
    private UUID tenantId;
    private String productName;
    private BigDecimal price;
    private Integer quantity;
    private Double quantityDouble;

    // Enrichment fields from CRM
    private String customerLevel;
    private BigDecimal totalSpent;

    // Enrichment fields from Context
    private String weather;
    private String activeEvent;
    private String competitorIntensity;

    /**
     * Compatibility: the order event sends "quantity" as Double,
     * so we also accept it and convert.
     */
    public void setQuantity(Object value) {
        if (value instanceof Integer i) {
            this.quantity = i;
        } else if (value instanceof Double d) {
            this.quantity = d.intValue();
            this.quantityDouble = d;
        } else if (value instanceof Number n) {
            this.quantity = n.intValue();
        }
    }
}
