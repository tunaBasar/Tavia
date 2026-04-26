package com.tavia.tenant_service.dto;

import com.tavia.tenant_service.entity.City;
import com.tavia.tenant_service.entity.SubscriptionPlan;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantCreateRequest {
    private String name;
    private City city;
    private String username;
    private String password;
    private SubscriptionPlan subscriptionPlan;
}
