package com.tavia.crm_service.dto;

import com.tavia.crm_service.entity.LoyaltyLevel;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDto {
    private UUID id;
    private String name;
    private String email;
    private BigDecimal totalSpent;
    private LoyaltyLevel loyaltyLevel;
}
