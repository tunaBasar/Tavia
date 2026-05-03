package com.tavia.trafficsimulator.dto;

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
    private String machineType;
    private String status;
}
