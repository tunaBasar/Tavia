package com.tavia.trafficsimulator.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.tavia.trafficsimulator.enums.MachineStatus;
import com.tavia.trafficsimulator.enums.MachineType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class MachineDto {
    private UUID id;
    private UUID tenantId;
    private String name;
    private String macAddress;
    private String firmwareVersion;
    private MachineType machineType;
    private MachineStatus status;
}
