package com.tavia.iot_service.service;

import com.tavia.iot_service.domain.Machine;
import com.tavia.iot_service.domain.enums.MachineStatus;
import com.tavia.iot_service.dto.MachineDto;
import com.tavia.iot_service.dto.MachineRegistrationRequestDto;
import com.tavia.iot_service.repository.MachineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MachineService {

    private final MachineRepository machineRepository;

    @Transactional
    public MachineDto registerMachine(UUID tenantId, MachineRegistrationRequestDto requestDto) {
        log.info("Registering new machine for tenant: {}, macAddress: {}", tenantId, requestDto.getMacAddress());

        Machine machine = Machine.builder()
                .tenantId(tenantId)
                .name(requestDto.getName())
                .macAddress(requestDto.getMacAddress())
                .machineType(requestDto.getMachineType())
                .status(MachineStatus.OFFLINE) // Default state
                .firmwareVersion("1.0.0") // Default firmware
                .build();

        Machine savedMachine = machineRepository.save(machine);
        log.info("Successfully registered machine with id: {}", savedMachine.getId());

        return mapToDto(savedMachine);
    }

    @Transactional(readOnly = true)
    public List<MachineDto> getMachinesByTenant(UUID tenantId) {
        log.debug("Fetching machines for tenant: {}", tenantId);
        return machineRepository.findAllByTenantId(tenantId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private MachineDto mapToDto(Machine machine) {
        return MachineDto.builder()
                .id(machine.getId())
                .tenantId(machine.getTenantId())
                .name(machine.getName())
                .macAddress(machine.getMacAddress())
                .firmwareVersion(machine.getFirmwareVersion())
                .machineType(machine.getMachineType())
                .status(machine.getStatus())
                .build();
    }
}
