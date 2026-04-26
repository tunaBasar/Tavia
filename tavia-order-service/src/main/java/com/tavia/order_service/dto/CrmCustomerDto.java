package com.tavia.order_service.dto;

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
    private String name;
    private String email;
    private BigDecimal totalSpent;
    private String loyaltyLevel;
}
