package com.tavia.inventory_service.service;

import com.tavia.inventory_service.dto.InventoryItemDto;
import com.tavia.inventory_service.entity.InventoryItem;
import com.tavia.inventory_service.exception.ResourceNotFoundException;
import com.tavia.inventory_service.mapper.InventoryMapper;
import com.tavia.inventory_service.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryMapper inventoryMapper;

    @Override
    @Transactional
    public InventoryItemDto addOrUpdateStock(InventoryItemDto dto) {
        log.info("Adding/Updating stock for product {} in tenant {}", dto.getProductName(), dto.getTenantId());
        
        Optional<InventoryItem> existingItemOpt = inventoryRepository.findByTenantIdAndProductName(dto.getTenantId(), dto.getProductName());
        
        InventoryItem itemToSave;
        if (existingItemOpt.isPresent()) {
            itemToSave = existingItemOpt.get();
            itemToSave.setQuantity(itemToSave.getQuantity() + dto.getQuantity());
        } else {
            itemToSave = inventoryMapper.toEntity(dto);
        }
        
        InventoryItem savedItem = inventoryRepository.save(itemToSave);
        return inventoryMapper.toDto(savedItem);
    }

    @Override
    public List<InventoryItemDto> getInventoryByTenantId(UUID tenantId) {
        log.info("Fetching inventory for tenant {}", tenantId);
        List<InventoryItem> items = inventoryRepository.findAllByTenantId(tenantId);
        return inventoryMapper.toDtoList(items);
    }

    @Override
    public InventoryItemDto getInventoryItem(UUID tenantId, String productName) {
        log.info("Fetching inventory item {} for tenant {}", productName, tenantId);
        InventoryItem item = inventoryRepository.findByTenantIdAndProductName(tenantId, productName)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found for product: " + productName));
        return inventoryMapper.toDto(item);
    }

    @Override
    @Transactional
    public void decreaseStock(UUID tenantId, String productName, Double quantityToDecrease) {
        log.info("Decreasing stock for product {} in tenant {} by {}", productName, tenantId, quantityToDecrease);
        
        InventoryItem item = inventoryRepository.findByTenantIdAndProductName(tenantId, productName)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found for product: " + productName));
        
        double newQuantity = item.getQuantity() - quantityToDecrease;
        if (newQuantity < 0) {
            newQuantity = 0;
        }
        
        item.setQuantity(newQuantity);
        inventoryRepository.save(item);
        
        if (newQuantity < 10) {
            log.warn("UYARI: Stok tükeniyor! Product: {}, Remaining: {}", productName, newQuantity);
        }
    }
}
