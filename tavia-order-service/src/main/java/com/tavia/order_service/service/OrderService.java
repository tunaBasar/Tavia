package com.tavia.order_service.service;

import com.tavia.order_service.dto.CreateOrderRequest;
import com.tavia.order_service.dto.OrderDto;

import java.util.List;
import java.util.UUID;

public interface OrderService {
    OrderDto createOrder(CreateOrderRequest request);
    OrderDto getOrderById(UUID id);
    List<OrderDto> getAllOrders();
    List<OrderDto> getOrdersByTenantId(UUID tenantId);
    long countOrdersByTenantId(UUID tenantId);
}
