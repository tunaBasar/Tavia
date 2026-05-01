package com.tavia.tenant_service.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tavia.tenant_service.entity.City;
import com.tavia.tenant_service.entity.Tenant;

public interface TenantRepository extends JpaRepository<Tenant,UUID> {
    boolean existsByUsername(String username);
    java.util.Optional<Tenant> findByUsername(String username);
    List<Tenant> findByCity(City city);
}
