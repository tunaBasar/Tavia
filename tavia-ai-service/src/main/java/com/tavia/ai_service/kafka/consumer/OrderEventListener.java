package com.tavia.ai_service.kafka.consumer;

import com.tavia.ai_service.domain.DailySales;
import com.tavia.ai_service.dto.OrderEventDto;
import com.tavia.ai_service.engine.RuleEngine;
import com.tavia.ai_service.repository.DailySalesRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventListener {

    private final DailySalesRepository dailySalesRepository;
    private final RuleEngine ruleEngine;

    @KafkaListener(topics = "order-events", groupId = "ai-group")
    @Transactional
    public void handleOrderEvent(OrderEventDto orderEventDto) {
        log.info("Received ENRICHED OrderEvent for AI processing: {}", orderEventDto);

        LocalDate today = LocalDate.now();
        DailySales dailySales = dailySalesRepository.findByTenantIdAndReportDate(orderEventDto.getTenantId(), today)
                .orElse(DailySales.builder()
                        .tenantId(orderEventDto.getTenantId())
                        .totalRevenue(BigDecimal.ZERO)
                        .totalOrders(0)
                        .reportDate(today)
                        .build());

        BigDecimal revenueToAdd = orderEventDto.getPrice();
        if (revenueToAdd == null) {
            revenueToAdd = BigDecimal.ZERO;
        }

        dailySales.setTotalRevenue(dailySales.getTotalRevenue().add(revenueToAdd));
        dailySales.setTotalOrders(dailySales.getTotalOrders() + 1);

        // Store enrichment data
        dailySales.setWeather(orderEventDto.getWeather());
        dailySales.setLoyaltyLevel(orderEventDto.getCustomerLevel());
        dailySales.setEventType(orderEventDto.getActiveEvent());

        dailySalesRepository.save(dailySales);
        log.info("Updated DailySales for tenant {}: revenue={}, orders={}, weather={}, loyalty={}, event={}", 
                dailySales.getTenantId(), dailySales.getTotalRevenue(), dailySales.getTotalOrders(),
                dailySales.getWeather(), dailySales.getLoyaltyLevel(), dailySales.getEventType());

        // Run Rule Engine
        List<String> suggestions = ruleEngine.evaluate(
                orderEventDto.getWeather(),
                orderEventDto.getCustomerLevel(),
                orderEventDto.getActiveEvent(),
                orderEventDto.getCompetitorIntensity()
        );

        log.info("AI Rule Engine suggestions for tenant {}: {}", orderEventDto.getTenantId(), suggestions);
    }
}
