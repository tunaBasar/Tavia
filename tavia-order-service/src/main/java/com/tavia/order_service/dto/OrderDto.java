package com.tavia.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private UUID id;
    private UUID tenantId;
    private UUID customerId;
    private String productName;
    private Integer quantity;
    private BigDecimal price;
    private LocalDateTime orderDate;
}
