package com.tavia.order_service.service;

import com.tavia.order_service.dto.CreateOrderRequest;
import com.tavia.order_service.dto.OrderDto;
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

    @Override
    public OrderDto createOrder(CreateOrderRequest request) {
        Order order = Order.builder()
                .tenantId(request.getTenantId())
                .customerId(request.getCustomerId())
                .productName(request.getProductName())
                .quantity(request.getQuantity())
                .price(request.getPrice())
                .build();

        Order savedOrder = orderRepository.save(order);
        OrderDto orderDto = orderMapper.toDto(savedOrder);
        
        orderEventProducer.sendOrderEvent(orderDto);
        log.info("Sipariş Kafka'ya gönderildi: {}", orderDto.getId());

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
}
