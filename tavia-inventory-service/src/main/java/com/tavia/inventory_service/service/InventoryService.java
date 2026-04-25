package com.tavia.inventory_service.service;

import com.tavia.inventory_service.dto.InventoryItemDto;

import java.util.List;
import java.util.UUID;

public interface InventoryService {
    InventoryItemDto addOrUpdateStock(InventoryItemDto inventoryItemDto);
    List<InventoryItemDto> getInventoryByTenantId(UUID tenantId);
    InventoryItemDto getInventoryItem(UUID tenantId, String productName);
    void decreaseStock(UUID tenantId, String productName, Double quantityToDecrease);
}
