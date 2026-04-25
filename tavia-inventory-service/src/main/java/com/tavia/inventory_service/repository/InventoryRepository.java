package com.tavia.inventory_service.repository;

import com.tavia.inventory_service.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryItem, UUID> {
    Optional<InventoryItem> findByTenantIdAndProductName(UUID tenantId, String productName);
    List<InventoryItem> findAllByTenantId(UUID tenantId);
}
