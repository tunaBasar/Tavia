package com.tavia.trafficsimulator.client;

import com.tavia.trafficsimulator.dto.ApiResponse;
import com.tavia.trafficsimulator.dto.CreateOrderRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@FeignClient(name = "tavia-order-service")
public interface OrderClient {
    @PostMapping("/api/v1/orders")
    ApiResponse<Object> createOrder(@RequestHeader("X-Tenant-ID") String tenantId,
                                    @RequestBody CreateOrderRequest request);

    @PatchMapping("/api/v1/orders/{orderId}/status")
    ApiResponse<Object> updateOrderStatus(@PathVariable("orderId") String orderId,
                                          @RequestBody Map<String, String> body);

    @GetMapping("/api/v1/orders")
    ApiResponse<List<Map<String, Object>>> getOrders(@RequestHeader("X-Tenant-ID") String tenantId);
}
