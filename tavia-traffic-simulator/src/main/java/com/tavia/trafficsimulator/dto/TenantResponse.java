package com.tavia.trafficsimulator.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.tavia.trafficsimulator.enums.City;
import com.tavia.trafficsimulator.enums.SubscriptionPlan;
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
@JsonIgnoreProperties(ignoreUnknown = true)
public class TenantResponse {
    private UUID id;
    private String name;
    private City city;
    private String username;
    private SubscriptionPlan subscriptionPlan;
    private boolean active;
    private LocalDateTime createdAt;
}
