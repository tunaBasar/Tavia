package com.tavia.iot_service.service;

import com.tavia.iot_service.domain.MachineTask;
import com.tavia.iot_service.domain.enums.MachineType;
import com.tavia.iot_service.domain.enums.TaskStatus;
import com.tavia.iot_service.domain.enums.TaskType;
import com.tavia.iot_service.dto.MachineTaskStatusUpdateDto;
import com.tavia.iot_service.dto.RawMaterialConsumptionEvent;
import com.tavia.iot_service.repository.MachineRepository;
import com.tavia.iot_service.repository.MachineTaskRepository;
import com.tavia.iot_service.service.producer.ConsumptionEventProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.UUID;
import jakarta.persistence.EntityNotFoundException;

@Service
@RequiredArgsConstructor
@Slf4j
public class IotTaskService {

    private final MachineTaskRepository taskRepository;
    private final MachineRepository machineRepository;
    private final ConsumptionEventProducer producer;

    @Transactional
    public void updateTaskStatus(UUID taskId, MachineTaskStatusUpdateDto dto, UUID tenantId) {
        MachineTask task = taskRepository.findByIdAndTenantId(taskId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found or doesn't belong to tenant"));

        task.setStatus(dto.getStatus());
        
        if (dto.getStatus() == TaskStatus.COMPLETED) {
            task.setCompletedAt(Instant.now());
            
            if (task.getTaskType() == TaskType.PREPARE_ORDER) {
                machineRepository.findByIdAndTenantId(task.getMachineId(), tenantId).ifPresent(machine -> {
                    if (machine.getMachineType() == MachineType.BREWER) {
                        RawMaterialConsumptionEvent event = RawMaterialConsumptionEvent.builder()
                                .orderId(task.getReferenceId())
                                .machineId(task.getMachineId())
                                .build();
                        producer.publishConsumptionEvent(event);
                    }
                });
            }
        }
        
        taskRepository.save(task);
        log.info("Task {} status updated to {}", taskId, dto.getStatus());
    }
}
