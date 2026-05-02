package com.tavia.iot_service.service;

import com.tavia.iot_service.domain.MachineTelemetry;
import com.tavia.iot_service.dto.MachineTelemetryDto;
import com.tavia.iot_service.repository.MachineTelemetryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class IotTelemetryService {

    private final MachineTelemetryRepository telemetryRepository;

    @Transactional
    public void processTelemetry(MachineTelemetryDto dto, UUID tenantId) {
        MachineTelemetry telemetry = MachineTelemetry.builder()
                .machineId(dto.getMachineId())
                .timestamp(dto.getTimestamp())
                .batteryLevel(dto.getBatteryLevel())
                .cpuTemperature(dto.getCpuTemperature())
                .coordinatesX(dto.getCoordinatesX())
                .coordinatesY(dto.getCoordinatesY())
                .networkSignalStrength(dto.getNetworkSignalStrength())
                .currentErrorCode(dto.getCurrentErrorCode())
                .sensorPayload(dto.getSensorPayload())
                .build();
                
        telemetryRepository.save(telemetry);
        log.debug("Processed telemetry for machine: {}", dto.getMachineId());
    }
}
