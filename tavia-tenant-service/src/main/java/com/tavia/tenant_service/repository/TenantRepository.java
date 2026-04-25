package com.tavia.tenant_service.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tavia.tenant_service.entity.Tenant;

public interface TenantRepository extends JpaRepository<Tenant,UUID> {
    boolean existsByUsername(String username);
    java.util.Optional<Tenant> findByUsername(String username);
}
