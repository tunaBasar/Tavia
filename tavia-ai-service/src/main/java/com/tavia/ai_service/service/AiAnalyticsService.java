package com.tavia.ai_service.service;

import com.tavia.ai_service.dto.DailySalesDto;
import com.tavia.ai_service.dto.WeeklySalesDto;

import java.util.UUID;

public interface AiAnalyticsService {
    DailySalesDto getDailySales(UUID tenantId);
    WeeklySalesDto getWeeklySales(UUID tenantId);
    String getAiInsights(UUID tenantId);
}
