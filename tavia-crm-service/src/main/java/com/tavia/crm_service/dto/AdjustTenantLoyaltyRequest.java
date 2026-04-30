package com.tavia.crm_service.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdjustTenantLoyaltyRequest {

    @NotNull(message = "Order amount is mandatory")
    @DecimalMin(value = "0.0", inclusive = false, message = "Order amount must be greater than zero")
    private BigDecimal orderAmount;
}
