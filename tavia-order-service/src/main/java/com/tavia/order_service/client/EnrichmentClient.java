package com.tavia.order_service.client;

import com.tavia.order_service.dto.ContextDataDto;
import com.tavia.order_service.dto.CrmCustomerDto;
import com.tavia.order_service.dto.ExternalApiResponse;
import com.tavia.order_service.enums.LoyaltyLevel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Client for enriching orders with CRM and Context data.
 * Implements manual circuit breaker logic with fallback values.
 * Orders must NEVER fail due to external service failures.
 */
@Slf4j
@Component
public class EnrichmentClient {

    private final RestClient crmClient;
    private final RestClient contextClient;

    public EnrichmentClient(
            RestClient.Builder restClientBuilder,
            @Value("${enrichment.crm.base-url:http://localhost:8086}") String crmBaseUrl,
            @Value("${enrichment.context.base-url:http://localhost:8087}") String contextBaseUrl) {
        this.crmClient = restClientBuilder.baseUrl(crmBaseUrl).build();
        this.contextClient = restClientBuilder.baseUrl(contextBaseUrl).build();
    }

    /**
     * Fetch customer data from CRM service with fallback.
     */
    public CrmCustomerDto getCustomer(UUID customerId) {
        if (customerId == null) {
            log.warn("No customerId provided, using fallback CRM data");
            return fallbackCustomer();
        }
        try {
            log.info("Calling CRM service for customer: {}", customerId);
            ExternalApiResponse<CrmCustomerDto> response = crmClient.get()
                    .uri("/api/v1/crm/customers/{id}", customerId)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            if (response != null && response.isSuccess() && response.getData() != null) {
                log.info("CRM data retrieved for customer: {}", customerId);
                return response.getData();
            }
            log.warn("CRM response was empty/unsuccessful for customer: {}, using fallback", customerId);
            return fallbackCustomer();
        } catch (Exception e) {
            log.error("Circuit breaker: CRM service call failed for customer {}: {}", customerId, e.getMessage());
            return fallbackCustomer();
        }
    }

    /**
     * Fetch context data from Context service with fallback.
     */
    public ContextDataDto getContext() {
        try {
            log.info("Calling Context service for current context");
            ExternalApiResponse<ContextDataDto> response = contextClient.get()
                    .uri("/api/v1/context")
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            if (response != null && response.isSuccess() && response.getData() != null) {
                log.info("Context data retrieved successfully");
                return response.getData();
            }
            log.warn("Context response was empty/unsuccessful, using fallback");
            return fallbackContext();
        } catch (Exception e) {
            log.error("Circuit breaker: Context service call failed: {}", e.getMessage());
            return fallbackContext();
        }
    }

    private CrmCustomerDto fallbackCustomer() {
        return CrmCustomerDto.builder()
                .loyaltyLevel(LoyaltyLevel.UNKNOWN)
                .totalSpent(BigDecimal.ZERO)
                .build();
    }

    private ContextDataDto fallbackContext() {
        return ContextDataDto.builder()
                .weather("UNKNOWN")
                .activeEvent("UNKNOWN")
                .competitorIntensity("UNKNOWN")
                .build();
    }
}
