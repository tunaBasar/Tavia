package com.tavia.order_service.repository;

import com.tavia.order_service.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findAllByTenantId(UUID tenantId);
    long countByTenantId(UUID tenantId);
}
