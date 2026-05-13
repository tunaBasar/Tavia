package com.tavia.ai_service.controller;

import com.tavia.ai_service.common.ApiResponse;
import com.tavia.ai_service.dto.DailySalesDto;
import com.tavia.ai_service.dto.WeeklySalesDto;
import com.tavia.ai_service.service.AiAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Analytics API", description = "Endpoints for AI insights and daily/weekly sales")
public class AiAnalyticsController {

    private final AiAnalyticsService aiAnalyticsService;

    @GetMapping("/daily/{tenantId}")
    @Operation(summary = "Get daily sales data for a tenant")
    public ResponseEntity<ApiResponse<DailySalesDto>> getDailySales(@PathVariable UUID tenantId) {
        DailySalesDto dto = aiAnalyticsService.getDailySales(tenantId);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/weekly/{tenantId}")
    @Operation(summary = "Get weekly aggregated sales data for a tenant (Mon–Sun)")
    public ResponseEntity<ApiResponse<WeeklySalesDto>> getWeeklySales(@PathVariable UUID tenantId) {
        WeeklySalesDto dto = aiAnalyticsService.getWeeklySales(tenantId);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/insights/{tenantId}")
    @Operation(summary = "Get AI generated insights for a tenant")
    public ResponseEntity<ApiResponse<String>> getAiInsights(@PathVariable UUID tenantId) {
        String insight = aiAnalyticsService.getAiInsights(tenantId);
        return ResponseEntity.ok(ApiResponse.success(insight));
    }
}
