package com.tavia.order_service.service;

import com.tavia.order_service.dto.CreateOrderRequest;
import com.tavia.order_service.dto.OrderDto;
import com.tavia.order_service.entity.Order;
import com.tavia.order_service.enums.OrderStatus;
import com.tavia.order_service.exception.ResourceNotFoundException;
import com.tavia.order_service.mapper.OrderMapper;
import com.tavia.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final OrderPostProcessor orderPostProcessor;

    @Override
    public OrderDto createOrder(UUID tenantId, CreateOrderRequest request) {
        // 1. Persist the order immediately with PENDING status
        Order order = Order.builder()
                .tenantId(tenantId)
                .customerId(request.getCustomerId())
                .productName(request.getProductName())
                .quantity(request.getQuantity())
                .price(request.getPrice())
                .build();

        Order savedOrder = orderRepository.save(order);
        OrderDto orderDto = orderMapper.toDto(savedOrder);
        log.info("Order {} created (PENDING) for product '{}' x{} in tenant {}",
                orderDto.getId(), orderDto.getProductName(), orderDto.getQuantity(), orderDto.getTenantId());

        // 2. Delegate all downstream work to an async thread so the client gets a fast 201
        orderPostProcessor.process(
                savedOrder.getId(), tenantId, request.getCustomerId(),
                request.getProductName(), request.getQuantity(), request.getPrice());

        return orderDto;
    }

    @Override
    public OrderDto updateOrderStatus(UUID orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);
        log.info("Order {} status updated to {}", orderId, newStatus);
        return orderMapper.toDto(updated);
    }

    @Override
    public OrderDto getOrderById(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return orderMapper.toDto(order);
    }

    @Override
    public List<OrderDto> getOrdersByTenantId(UUID tenantId) {
        log.info("Fetching orders for tenant: {}", tenantId);
        return orderRepository.findAllByTenantId(tenantId).stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDto> getOrdersByTenantIdThisWeek(UUID tenantId) {
        LocalDateTime weekStart = LocalDateTime.now()
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                .toLocalDate().atStartOfDay();
        log.info("Fetching weekly orders for tenant {} since {}", tenantId, weekStart);
        return orderRepository.findAllByTenantIdAndOrderDateAfter(tenantId, weekStart).stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public long countOrdersByTenantId(UUID tenantId) {
        log.info("Counting orders for tenant: {}", tenantId);
        return orderRepository.countByTenantId(tenantId);
    }

    @Override
    public List<OrderDto> getOrdersByTenantIdAndStatus(UUID tenantId, OrderStatus status) {
        return orderRepository.findAllByTenantIdAndStatus(tenantId, status).stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }
}
