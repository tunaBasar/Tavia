package com.tavia.order_service.service;

import com.tavia.order_service.catalog.RecipeResolutionService;
import com.tavia.order_service.client.EnrichmentClient;
import com.tavia.order_service.client.InventoryClient;
import com.tavia.order_service.dto.CreateOrderRequest;
import com.tavia.order_service.dto.OrderDto;
import com.tavia.order_service.dto.RecipeIngredient;
import com.tavia.order_service.entity.Order;
import com.tavia.order_service.exception.ResourceNotFoundException;
import com.tavia.order_service.kafka.OrderEventProducer;
import com.tavia.order_service.mapper.OrderMapper;
import com.tavia.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final OrderEventProducer orderEventProducer;
    private final EnrichmentClient enrichmentClient;
    private final RecipeResolutionService recipeResolutionService;
    private final InventoryClient inventoryClient;

    @Override
    public OrderDto createOrder(CreateOrderRequest request) {
        // 1. Persist the order (final product)
        Order order = Order.builder()
                .tenantId(request.getTenantId())
                .customerId(request.getCustomerId())
                .productName(request.getProductName())
                .quantity(request.getQuantity())
                .price(request.getPrice())
                .build();

        Order savedOrder = orderRepository.save(order);
        OrderDto orderDto = orderMapper.toDto(savedOrder);
        log.info("Order {} created for product '{}' x{} in tenant {}",
                orderDto.getId(), orderDto.getProductName(), orderDto.getQuantity(), orderDto.getTenantId());

        // 2. Resolve recipe: translate final product → raw material ingredients
        List<RecipeIngredient> ingredients = recipeResolutionService.resolveRecipe(
                request.getProductName(), request.getQuantity());

        if (ingredients.isEmpty()) {
            log.warn("No recipe found for product '{}'. Skipping inventory deduction.", request.getProductName());
        } else {
            log.info("Recipe resolved for '{}': {} raw material(s)", request.getProductName(), ingredients.size());
            // 3. Deduct raw materials via inventory-service REST call (best-effort)
            inventoryClient.deductRawMaterials(request.getTenantId(), ingredients);
        }

        // 4. Adjust tenant loyalty via CRM
        enrichmentClient.adjustTenantLoyalty(orderDto.getCustomerId(), orderDto.getTenantId(), orderDto.getPrice());

        // 5. Publish enriched Kafka event (includes recipe deduction data)
        orderEventProducer.sendOrderEvent(orderDto, ingredients);
        log.info("Order {} published to Kafka with {} recipe deductions", orderDto.getId(), ingredients.size());

        return orderDto;
    }

    @Override
    public OrderDto getOrderById(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return orderMapper.toDto(order);
    }

    @Override
    public List<OrderDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDto> getOrdersByTenantId(UUID tenantId) {
        log.info("Fetching orders for tenant: {}", tenantId);
        return orderRepository.findAllByTenantId(tenantId).stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public long countOrdersByTenantId(UUID tenantId) {
        log.info("Counting orders for tenant: {}", tenantId);
        return orderRepository.countByTenantId(tenantId);
    }
}
