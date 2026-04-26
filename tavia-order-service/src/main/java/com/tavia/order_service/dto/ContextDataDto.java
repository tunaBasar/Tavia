package com.tavia.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContextDataDto {
    private String weather;
    private String activeEvent;
    private String competitorIntensity;
}
