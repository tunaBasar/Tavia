package com.tavia.order_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCustomerRequest {
    @NotBlank(message = "Full name is mandatory")
    private String fullName;

    @NotBlank(message = "Phone number is mandatory")
    private String phoneNumber;
}
