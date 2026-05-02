package com.tavia.iot_service.dto;

import com.tavia.iot_service.domain.enums.MachineStatus;
import com.tavia.iot_service.domain.enums.MachineType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MachineDto {
    private UUID id;
    private UUID tenantId;
    private String name;
    private String macAddress;
    private String firmwareVersion;
    private MachineType machineType;
    private MachineStatus status;
}
