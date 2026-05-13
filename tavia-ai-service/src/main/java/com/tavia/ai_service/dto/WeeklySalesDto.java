package com.tavia.ai_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklySalesDto {
    private UUID tenantId;
    private LocalDate weekStart;
    private LocalDate weekEnd;
    private BigDecimal totalRevenue;
    private Integer totalOrders;
    private List<DailySalesDto> dailyBreakdown;
}
