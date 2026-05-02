package com.tavia.iot_service.dto;

import com.tavia.iot_service.domain.enums.MachineType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MachineRegistrationRequestDto {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "MAC Address is required")
    private String macAddress;

    @NotNull(message = "Machine Type is required")
    private MachineType machineType;
}
