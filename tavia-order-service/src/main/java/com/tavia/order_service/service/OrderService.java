package com.tavia.order_service.service;

import com.tavia.order_service.dto.CreateOrderRequest;
import com.tavia.order_service.dto.OrderDto;
import com.tavia.order_service.enums.OrderStatus;

import java.util.List;
import java.util.UUID;

public interface OrderService {
    OrderDto createOrder(UUID tenantId, CreateOrderRequest request);
    OrderDto updateOrderStatus(UUID orderId, OrderStatus newStatus);
    OrderDto getOrderById(UUID id);
    List<OrderDto> getOrdersByTenantId(UUID tenantId);
    List<OrderDto> getOrdersByTenantIdThisWeek(UUID tenantId);
    List<OrderDto> getOrdersByTenantIdAndStatus(UUID tenantId, OrderStatus status);
    long countOrdersByTenantId(UUID tenantId);
}
