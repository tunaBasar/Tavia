package com.tavia.ai_service.service.impl;

import com.tavia.ai_service.domain.DailySales;
import com.tavia.ai_service.dto.DailySalesDto;
import com.tavia.ai_service.mapper.DailySalesMapper;
import com.tavia.ai_service.repository.DailySalesRepository;
import com.tavia.ai_service.service.AiAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AiAnalyticsServiceImpl implements AiAnalyticsService {

    private final DailySalesRepository dailySalesRepository;
    private final DailySalesMapper dailySalesMapper;

    @Override
    public DailySalesDto getDailySales(UUID tenantId) {
        LocalDate today = LocalDate.now();
        DailySales sales = dailySalesRepository.findByTenantIdAndReportDate(tenantId, today)
                .orElseThrow(() -> new RuntimeException("No sales data found for today for tenant: " + tenantId));
        return dailySalesMapper.toDto(sales);
    }

    @Override
    public String getAiInsights(UUID tenantId) {
        // In the future, this would call an AI model API.
        // For now, return a mock insight.
        return "Cironuz harika, Latte stoklarını artırın!";
    }
}
