package com.tavia.iot_service.controller;

import com.tavia.iot_service.dto.MachineTelemetryDto;
import com.tavia.iot_service.dto.MachineTaskStatusUpdateDto;
import com.tavia.iot_service.service.IotTaskService;
import com.tavia.iot_service.service.IotTelemetryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/iot")
@RequiredArgsConstructor
public class IotController {

    private final IotTelemetryService telemetryService;
    private final IotTaskService taskService;

    @PostMapping("/telemetry")
    public ResponseEntity<Void> ingestTelemetry(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @Valid @RequestBody MachineTelemetryDto telemetryDto) {
        
        telemetryService.processTelemetry(telemetryDto, tenantId);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/tasks/{taskId}/status")
    public ResponseEntity<Void> updateTaskStatus(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @PathVariable UUID taskId,
            @Valid @RequestBody MachineTaskStatusUpdateDto statusUpdateDto) {
        
        taskService.updateTaskStatus(taskId, statusUpdateDto, tenantId);
        return ResponseEntity.ok().build();
    }
}
