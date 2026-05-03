package com.tavia.trafficsimulator.client;

import com.tavia.trafficsimulator.dto.ApiResponse;
import com.tavia.trafficsimulator.dto.CreateOrderRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "tavia-order-service")
public interface OrderClient {
    @PostMapping("/api/v1/orders")
    ApiResponse<Object> createOrder(@RequestHeader("X-Tenant-ID") String tenantId,
                                    @RequestBody CreateOrderRequest request);
}
