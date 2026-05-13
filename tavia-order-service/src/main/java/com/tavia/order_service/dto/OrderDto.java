package com.tavia.order_service.dto;

import com.tavia.order_service.enums.LoyaltyLevel;
import com.tavia.order_service.enums.OrderStatus;
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
    private OrderStatus status;
    private String customerName;
    private LoyaltyLevel loyaltyLevel;
    private LocalDateTime orderDate;
}
