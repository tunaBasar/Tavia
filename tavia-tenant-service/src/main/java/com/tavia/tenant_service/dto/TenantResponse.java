package com.tavia.tenant_service.dto;

import com.tavia.tenant_service.entity.SubscriptionPlan;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantResponse {
    private UUID id;
    private String name;
    private String location;
    private String username;
    private SubscriptionPlan subscriptionPlan;
    private boolean isActive;
    private LocalDateTime createdAt;
}
