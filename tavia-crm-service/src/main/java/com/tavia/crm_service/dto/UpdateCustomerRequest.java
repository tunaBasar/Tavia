package com.tavia.crm_service.dto;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCustomerRequest {

    private String name;

    @Email(message = "Email must be valid")
    private String email;

    private BigDecimal totalSpent;

    private String loyaltyLevel;
}
