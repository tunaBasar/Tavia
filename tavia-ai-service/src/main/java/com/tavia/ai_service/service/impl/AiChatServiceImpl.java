package com.tavia.ai_service.service.impl;

import com.tavia.ai_service.client.GeminiApiClient;
import com.tavia.ai_service.common.ApiResponse;
import com.tavia.ai_service.dto.AiChatRequest;
import com.tavia.ai_service.dto.AiChatResponse;
import com.tavia.ai_service.dto.CustomerDto;
import com.tavia.ai_service.service.AiChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.UUID;

@Slf4j
@Service
public class AiChatServiceImpl implements AiChatService {

    private final GeminiApiClient geminiApiClient;
    private final RestClient.Builder loadBalancedRestClientBuilder;

    public AiChatServiceImpl(GeminiApiClient geminiApiClient,
                             @Qualifier("loadBalancedRestClientBuilder") RestClient.Builder loadBalancedRestClientBuilder) {
        this.geminiApiClient = geminiApiClient;
        this.loadBalancedRestClientBuilder = loadBalancedRestClientBuilder;
    }

    @Value("${gemini.system-prompt}")
    private String baseSystemPrompt;

    @Override
    public AiChatResponse processChat(UUID tenantId, AiChatRequest request) {
        log.info("Processing chat for customer: {} in tenant: {}", request.getCustomerId(), tenantId);

        // 1. Retrieve customer profile from CRM service
        CustomerDto customer = getCustomerProfile(request.getCustomerId(), tenantId);

        // 2. Build composite system prompt: base confinement rules + dynamic customer context
        String systemPrompt = buildSystemPrompt(customer, tenantId);

        // 3. Call Gemini API with the confined system instruction
        String reply = geminiApiClient.generateContent(systemPrompt, request.getMessage());

        return new AiChatResponse(reply);
    }

    private CustomerDto getCustomerProfile(UUID customerId, UUID tenantId) {
        try {
            RestClient restClient = loadBalancedRestClientBuilder.build();
            ApiResponse<CustomerDto> response = restClient.get()
                    .uri("http://tavia-crm-service/api/v1/crm/customers/{id}", customerId)
                    .header("X-Tenant-ID", tenantId.toString())
                    .retrieve()
                    .body(new ParameterizedTypeReference<ApiResponse<CustomerDto>>() {});

            if (response != null && response.isSuccess() && response.getData() != null) {
                return response.getData();
            }
        } catch (Exception e) {
            log.error("Failed to retrieve customer profile for ID: {}", customerId, e);
        }

        // Return a generic profile if retrieval fails to not block the chat completely
        CustomerDto fallback = new CustomerDto();
        fallback.setName("Valued Guest");
        fallback.setLoyaltyLevel("GUEST");
        return fallback;
    }

    /**
     * Combines the externalized base system prompt (confinement rules) with dynamic,
     * per-request customer context so Gemini can personalize its responses while
     * remaining strictly within the TAVIA domain boundary.
     */
    private String buildSystemPrompt(CustomerDto customer, UUID tenantId) {
        String customerContext = String.format(
            "\n\n--- CUSTOMER CONTEXT ---\n" +
            "Name: %s\n" +
            "Loyalty Tier: %s\n" +
            "City: %s\n" +
            "Total Spent at This Cafe: %s\n" +
            "Tenant ID: %s\n" +
            "--- END CONTEXT ---",
            customer.getName(),
            customer.getLoyaltyLevel(),
            customer.getCity() != null ? customer.getCity() : "Unknown",
            customer.getTotalSpentInThisTenant() != null ? customer.getTotalSpentInThisTenant() + " TL" : "N/A",
            tenantId
        );

        return baseSystemPrompt + customerContext;
    }
}

