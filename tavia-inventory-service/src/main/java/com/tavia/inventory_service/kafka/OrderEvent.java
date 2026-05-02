package com.tavia.inventory_service.kafka;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Kafka event consumed by inventory-service when an order is placed.
 * Now carries recipe-resolved raw material deductions instead of a single product name.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class OrderEvent {
    private UUID orderId;
    private UUID tenantId;
    private String productName;

    /** Recipe-resolved deduction items (raw materials to deduct). */
    private List<RawMaterialDeduction> deductions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class RawMaterialDeduction {
        private String rawMaterialName;
        private Double quantity;
        private String unit;
    }
}
