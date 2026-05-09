package com.tavia.ai_service.kafka.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiCommandEventDto {
    private UUID tenantId;
    private UUID targetId;
    private String commandType; // e.g., "PROCURE_MACHINE", "UPDATE_PRICE", "SCHEDULE_MAINTENANCE"
    private String payloadJson;
}
