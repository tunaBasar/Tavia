package com.tavia.tenant_service.service;

import com.tavia.tenant_service.dto.TenantCreateRequest;
import com.tavia.tenant_service.dto.TenantLoginRequest;
import com.tavia.tenant_service.dto.TenantResponse;
import com.tavia.tenant_service.entity.City;

import java.util.List;
import java.util.UUID;

public interface TenantService {
    TenantResponse register(TenantCreateRequest request);
    TenantResponse login(TenantLoginRequest request);
    List<TenantResponse> listAllTenants();
    List<TenantResponse> listTenantsByCity(City city);
    TenantResponse updateTenantStatus(UUID id, boolean isActive);
}
