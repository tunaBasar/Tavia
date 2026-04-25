package com.tavia.inventory_service.mapper;

import com.tavia.inventory_service.dto.InventoryItemDto;
import com.tavia.inventory_service.entity.InventoryItem;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface InventoryMapper {
    InventoryItemDto toDto(InventoryItem entity);
    InventoryItem toEntity(InventoryItemDto dto);
    List<InventoryItemDto> toDtoList(List<InventoryItem> entityList);
}
