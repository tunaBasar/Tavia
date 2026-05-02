package com.tavia.inventory_service.mapper;

import com.tavia.inventory_service.dto.RawMaterialDto;
import com.tavia.inventory_service.entity.RawMaterial;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RawMaterialMapper {
    RawMaterialDto toDto(RawMaterial entity);
    RawMaterial toEntity(RawMaterialDto dto);
    List<RawMaterialDto> toDtoList(List<RawMaterial> entityList);
}
