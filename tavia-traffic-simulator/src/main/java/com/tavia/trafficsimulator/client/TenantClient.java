package com.tavia.trafficsimulator.client;

import com.tavia.trafficsimulator.dto.ApiResponse;
import com.tavia.trafficsimulator.dto.TenantResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "tavia-tenant-service")
public interface TenantClient {
    @GetMapping("/api/v1/tenants")
    ApiResponse<List<TenantResponse>> getAllTenants();
}
