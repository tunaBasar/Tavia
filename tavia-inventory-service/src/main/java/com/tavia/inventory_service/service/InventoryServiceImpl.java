package com.tavia.inventory_service.service;

import com.tavia.inventory_service.dto.DeductionItem;
import com.tavia.inventory_service.dto.RawMaterialDto;
import com.tavia.inventory_service.entity.RawMaterial;
import com.tavia.inventory_service.exception.ResourceNotFoundException;
import com.tavia.inventory_service.mapper.RawMaterialMapper;
import com.tavia.inventory_service.repository.RawMaterialRepository;
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

    private final RawMaterialRepository rawMaterialRepository;
    private final RawMaterialMapper rawMaterialMapper;

    @Override
    @Transactional
    public RawMaterialDto addOrUpdateStock(UUID tenantId, RawMaterialDto dto) {
        log.info("Adding/Updating stock for raw material '{}' in tenant {}", dto.getName(), tenantId);

        Optional<RawMaterial> existingOpt = rawMaterialRepository.findByTenantIdAndName(tenantId, dto.getName());

        RawMaterial materialToSave;
        if (existingOpt.isPresent()) {
            materialToSave = existingOpt.get();
            materialToSave.setStockQuantity(materialToSave.getStockQuantity() + dto.getStockQuantity());
            materialToSave.setUnit(dto.getUnit());
        } else {
            materialToSave = rawMaterialMapper.toEntity(dto);
            materialToSave.setTenantId(tenantId);
        }

        RawMaterial saved = rawMaterialRepository.save(materialToSave);
        return rawMaterialMapper.toDto(saved);
    }

    @Override
    public List<RawMaterialDto> getRawMaterialsByTenantId(UUID tenantId) {
        log.info("Fetching raw materials for tenant {}", tenantId);
        List<RawMaterial> materials = rawMaterialRepository.findAllByTenantId(tenantId);
        return rawMaterialMapper.toDtoList(materials);
    }

    @Override
    public RawMaterialDto getRawMaterial(UUID tenantId, String name) {
        log.info("Fetching raw material '{}' for tenant {}", name, tenantId);
        RawMaterial material = rawMaterialRepository.findByTenantIdAndName(tenantId, name)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Raw material not found: " + name + " for tenant: " + tenantId));
        return rawMaterialMapper.toDto(material);
    }

    @Override
    @Transactional
    public void deductBatch(UUID tenantId, List<DeductionItem> items) {
        log.info("Processing batch deduction of {} items for tenant {}", items.size(), tenantId);

        for (DeductionItem item : items) {
            RawMaterial material = rawMaterialRepository.findByTenantIdAndName(tenantId, item.getRawMaterialName())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Raw material not found for deduction: " + item.getRawMaterialName()));

            double newQuantity = material.getStockQuantity() - item.getQuantity();
            if (newQuantity < 0) {
                log.warn("Insufficient stock for '{}'. Available: {}, Requested: {}. Setting to 0.",
                        item.getRawMaterialName(), material.getStockQuantity(), item.getQuantity());
                newQuantity = 0;
            }

            material.setStockQuantity(newQuantity);
            rawMaterialRepository.save(material);

            if (newQuantity < 10) {
                log.warn("LOW STOCK ALERT: Raw material '{}' for tenant {} is at {} {}",
                        item.getRawMaterialName(), tenantId, newQuantity, material.getUnit());
            }

            log.info("Deducted {} {} of '{}' — remaining: {}",
                    item.getQuantity(), item.getUnit(), item.getRawMaterialName(), newQuantity);
        }
    }
}
