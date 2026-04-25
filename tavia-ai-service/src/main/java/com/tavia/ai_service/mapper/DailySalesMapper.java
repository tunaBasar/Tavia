package com.tavia.ai_service.mapper;

import com.tavia.ai_service.domain.DailySales;
import com.tavia.ai_service.dto.DailySalesDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DailySalesMapper {
    DailySalesDto toDto(DailySales entity);
    DailySales toEntity(DailySalesDto dto);
}
