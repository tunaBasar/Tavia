package com.tavia.ai_service.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CustomerDto {
    private UUID id;
    private String name;
    private String email;
    private String city;
    private String loyaltyLevel;
    private BigDecimal totalSpentInThisTenant;
}
