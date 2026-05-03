package com.tavia.trafficsimulator.client;

import com.tavia.trafficsimulator.dto.MachineDto;
import com.tavia.trafficsimulator.dto.MachineTelemetryDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;

@FeignClient(name = "tavia-iot-service")
public interface IotClient {
    @GetMapping("/api/v1/iot/machines")
    List<MachineDto> getMachines(@RequestHeader("X-Tenant-ID") String tenantId);

    @PostMapping("/api/v1/iot/telemetry")
    void sendTelemetry(@RequestHeader("X-Tenant-ID") String tenantId, @RequestBody MachineTelemetryDto telemetry);
}
