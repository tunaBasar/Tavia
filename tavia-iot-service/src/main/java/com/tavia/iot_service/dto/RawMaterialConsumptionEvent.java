package com.tavia.iot_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RawMaterialConsumptionEvent {
    private String orderId;
    private UUID machineId;
}
