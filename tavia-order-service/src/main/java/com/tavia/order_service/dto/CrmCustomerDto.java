package com.tavia.order_service.dto;

import com.tavia.order_service.enums.LoyaltyLevel;
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
public class CrmCustomerDto {
    private UUID id;
    private UUID tenantId;
    private String name;
    private String email;
    private BigDecimal totalSpentInThisTenant;
    private LoyaltyLevel loyaltyLevel;
}
