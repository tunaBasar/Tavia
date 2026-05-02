package com.tavia.iot_service.controller;

import com.tavia.iot_service.dto.MachineDto;
import com.tavia.iot_service.dto.MachineRegistrationRequestDto;
import com.tavia.iot_service.service.MachineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/iot/machines")
@RequiredArgsConstructor
public class MachineController {

    private final MachineService machineService;

    @PostMapping
    public ResponseEntity<MachineDto> registerMachine(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @Valid @RequestBody MachineRegistrationRequestDto requestDto) {
        
        MachineDto registeredMachine = machineService.registerMachine(tenantId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(registeredMachine);
    }

    @GetMapping
    public ResponseEntity<List<MachineDto>> getMachines(
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        
        List<MachineDto> machines = machineService.getMachinesByTenant(tenantId);
        return ResponseEntity.ok(machines);
    }
}
