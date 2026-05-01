package com.tavia.ai_service.mapper;

import com.tavia.ai_service.domain.DailySales;
import com.tavia.ai_service.dto.DailySalesDto;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DailySalesMapper {
    DailySalesDto toDto(DailySales entity);
    DailySales toEntity(DailySalesDto dto);
}
