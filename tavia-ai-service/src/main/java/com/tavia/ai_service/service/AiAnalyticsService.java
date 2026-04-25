package com.tavia.ai_service.service;

import com.tavia.ai_service.dto.DailySalesDto;

import java.util.UUID;

public interface AiAnalyticsService {
    DailySalesDto getDailySales(UUID tenantId);
    String getAiInsights(UUID tenantId);
}
