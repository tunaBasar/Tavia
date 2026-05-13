package com.tavia.order_service.repository;

import com.tavia.order_service.entity.Order;
import com.tavia.order_service.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findAllByTenantId(UUID tenantId);
    List<Order> findAllByTenantIdAndOrderDateAfter(UUID tenantId, LocalDateTime after);
    List<Order> findAllByTenantIdAndStatus(UUID tenantId, OrderStatus status);
    long countByTenantId(UUID tenantId);
}
