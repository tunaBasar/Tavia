package com.tavia.inventory_service.service;

import com.tavia.inventory_service.dto.DeductionItem;
import com.tavia.inventory_service.dto.RawMaterialDto;

import java.util.List;
import java.util.UUID;

public interface InventoryService {

    /** Add a new raw material or increase existing stock for a tenant. */
    RawMaterialDto addOrUpdateStock(UUID tenantId, RawMaterialDto rawMaterialDto);

    /** List all raw materials for a given tenant. */
    List<RawMaterialDto> getRawMaterialsByTenantId(UUID tenantId);

    /** Get a specific raw material by tenant and name. */
    RawMaterialDto getRawMaterial(UUID tenantId, String name);

    /**
     * Batch deduction of multiple raw materials for a given tenant.
     * This is the core DDD operation — called after recipe resolution
     * translates a final product order into raw material quantities.
     */
    void deductBatch(UUID tenantId, List<DeductionItem> items);
}
