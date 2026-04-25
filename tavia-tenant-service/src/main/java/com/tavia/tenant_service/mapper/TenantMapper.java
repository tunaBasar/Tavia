package com.tavia.tenant_service.mapper;

import com.tavia.tenant_service.dto.TenantCreateRequest;
import com.tavia.tenant_service.dto.TenantResponse;
import com.tavia.tenant_service.entity.Tenant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TenantMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    Tenant toEntity(TenantCreateRequest request);

    @Mapping(target = "isActive", source = "active")
    TenantResponse toResponse(Tenant tenant);

    List<TenantResponse> toResponseList(List<Tenant> tenants);
}
