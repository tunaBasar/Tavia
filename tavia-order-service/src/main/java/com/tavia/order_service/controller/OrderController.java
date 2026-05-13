package com.tavia.order_service.controller;

import com.tavia.order_service.dto.ApiResponse;
import com.tavia.order_service.dto.CreateOrderRequest;
import com.tavia.order_service.dto.OrderDto;
import com.tavia.order_service.enums.OrderStatus;
import com.tavia.order_service.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDto>> createOrder(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @Valid @RequestBody CreateOrderRequest request) {
        OrderDto orderDto = orderService.createOrder(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(orderDto, "Order created successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        OrderStatus newStatus = OrderStatus.valueOf(body.get("status"));
        OrderDto orderDto = orderService.updateOrderStatus(id, newStatus);
        return ResponseEntity.ok(ApiResponse.success(orderDto, "Order status updated"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(@PathVariable UUID id) {
        OrderDto orderDto = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(orderDto));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderDto>>> getOrdersByTenant(
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        List<OrderDto> orders = orderService.getOrdersByTenantId(tenantId);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/weekly")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getOrdersByTenantThisWeek(
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        List<OrderDto> orders = orderService.getOrdersByTenantIdThisWeek(tenantId);
        return ResponseEntity.ok(ApiResponse.success(orders, "Weekly orders retrieved"));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> countOrdersByTenant(
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        long count = orderService.countOrdersByTenantId(tenantId);
        return ResponseEntity.ok(ApiResponse.success(count, "Order count retrieved"));
    }
}
