package com.tavia.tenant_service.service;

import com.tavia.tenant_service.dto.TenantCreateRequest;
import com.tavia.tenant_service.dto.TenantLoginRequest;
import com.tavia.tenant_service.dto.TenantResponse;
import com.tavia.tenant_service.entity.City;
import com.tavia.tenant_service.entity.SubscriptionPlan;
import com.tavia.tenant_service.entity.Tenant;
import com.tavia.tenant_service.exception.BusinessException;
import com.tavia.tenant_service.exception.TenantNotFoundException;
import com.tavia.tenant_service.mapper.TenantMapper;
import com.tavia.tenant_service.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenantServiceImpl implements TenantService {

    private final TenantRepository tenantRepository;
    private final TenantMapper tenantMapper;

    @Override
    public TenantResponse register(TenantCreateRequest request) {
        log.info("Registering new tenant with username: {}", request.getUsername());
        
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new BusinessException("Kullanici adi zorunludur.");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BusinessException("Sifre zorunludur.");
        }
        if (tenantRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Bu kullanici adi zaten kayitli.");
        }

        if (request.getCity() == null) {
            throw new BusinessException("Sehir alani zorunludur. Gecerli degerler: " + java.util.Arrays.toString(City.values()));
        }

        if (request.getSubscriptionPlan() == null) {
            request.setSubscriptionPlan(SubscriptionPlan.BASIC);
        }

        Tenant tenant = tenantMapper.toEntity(request);
        Tenant savedTenant = tenantRepository.save(tenant);
        
        log.info("Tenant successfully registered with ID: {}", savedTenant.getId());
        return tenantMapper.toResponse(savedTenant);
    }

    @Override
    public TenantResponse login(TenantLoginRequest request) {
        log.info("Login attempt for username: {}", request.getUsername());
        
        Tenant tenant = tenantRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new TenantNotFoundException("Gecersiz kullanici adi veya sifre."));

        if (!tenant.getPassword().equals(request.getPassword())) {
            throw new BusinessException("Gecersiz kullanici adi veya sifre.");
        }

        if (!tenant.isActive()) {
            throw new BusinessException("Tenant hesabi aktif degil.");
        }

        log.info("Login successful for username: {}", request.getUsername());
        return tenantMapper.toResponse(tenant);
    }

    @Override
    public List<TenantResponse> listAllTenants() {
        log.info("Listing all tenants");
        List<Tenant> tenants = tenantRepository.findAll();
        return tenantMapper.toResponseList(tenants);
    }

    @Override
    public TenantResponse updateTenantStatus(UUID id, boolean isActive) {
        log.info("Updating status for tenant ID: {} to {}", id, isActive);
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new TenantNotFoundException("Tenant bulunamadi. ID: " + id));
        
        tenant.setActive(isActive);
        Tenant updatedTenant = tenantRepository.save(tenant);
        log.info("Tenant status updated successfully for ID: {}", id);
        return tenantMapper.toResponse(updatedTenant);
    }

    @Override
    public List<TenantResponse> listTenantsByCity(City city) {
        log.info("Listing tenants for city: {}", city);
        List<Tenant> tenants = tenantRepository.findByCity(city);
        return tenantMapper.toResponseList(tenants);
    }
}
