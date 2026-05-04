package com.tavia.trafficsimulator.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.tavia.trafficsimulator.enums.City;
import com.tavia.trafficsimulator.enums.LoyaltyLevel;
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
@JsonIgnoreProperties(ignoreUnknown = true)
public class CustomerDto {
    private UUID id;
    private String name;
    private String email;
    private City city;
    private LoyaltyLevel loyaltyLevel;
    private BigDecimal totalSpentInThisTenant;
}
