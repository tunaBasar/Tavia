package com.tavia.ai_service.service.impl;

import com.tavia.ai_service.domain.DailySales;
import com.tavia.ai_service.dto.DailySalesDto;
import com.tavia.ai_service.engine.RuleEngine;
import com.tavia.ai_service.mapper.DailySalesMapper;
import com.tavia.ai_service.repository.DailySalesRepository;
import com.tavia.ai_service.service.AiAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AiAnalyticsServiceImpl implements AiAnalyticsService {

    private final DailySalesRepository dailySalesRepository;
    private final DailySalesMapper dailySalesMapper;
    private final RuleEngine ruleEngine;

    @Override
    public DailySalesDto getDailySales(UUID tenantId) {
        LocalDate today = LocalDate.now();
        DailySales sales = dailySalesRepository.findByTenantIdAndReportDate(tenantId, today)
                .orElseThrow(() -> new RuntimeException("No sales data found for today for tenant: " + tenantId));
        return dailySalesMapper.toDto(sales);
    }

    @Override
    public String getAiInsights(UUID tenantId) {
        LocalDate today = LocalDate.now();
        DailySales sales = dailySalesRepository.findByTenantIdAndReportDate(tenantId, today)
                .orElse(null);

        if (sales == null) {
            return "No data available for today — cannot generate insights.";
        }

        // Use Rule Engine with stored enrichment data
        List<String> suggestions = ruleEngine.evaluate(
                sales.getWeather(),
                sales.getLoyaltyLevel(),
                sales.getEventType(),
                null // competitorIntensity not stored on DailySales, rules handle null gracefully
        );

        StringBuilder insight = new StringBuilder();
        insight.append("AI Insights for tenant ").append(tenantId).append(":\n");
        insight.append("Total Revenue: ").append(sales.getTotalRevenue()).append("\n");
        insight.append("Total Orders: ").append(sales.getTotalOrders()).append("\n");
        insight.append("Weather: ").append(sales.getWeather()).append("\n");
        insight.append("Loyalty Level: ").append(sales.getLoyaltyLevel()).append("\n");
        insight.append("Event: ").append(sales.getEventType()).append("\n");
        insight.append("Suggestions:\n");
        for (String suggestion : suggestions) {
            insight.append("  → ").append(suggestion).append("\n");
        }

        return insight.toString();
    }
}
