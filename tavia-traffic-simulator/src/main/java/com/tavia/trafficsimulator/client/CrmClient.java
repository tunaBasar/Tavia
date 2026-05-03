package com.tavia.trafficsimulator.client;

import com.tavia.trafficsimulator.dto.ApiResponse;
import com.tavia.trafficsimulator.dto.CustomerDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;

@FeignClient(name = "tavia-crm-service")
public interface CrmClient {
    @GetMapping("/api/v1/crm/customers")
    ApiResponse<List<CustomerDto>> getCustomersByTenant(@RequestHeader("X-Tenant-ID") String tenantId);
}
