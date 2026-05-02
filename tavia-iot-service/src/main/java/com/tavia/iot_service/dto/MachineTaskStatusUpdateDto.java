package com.tavia.iot_service.dto;

import com.tavia.iot_service.domain.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MachineTaskStatusUpdateDto {
    @NotNull
    private TaskStatus status;
}
