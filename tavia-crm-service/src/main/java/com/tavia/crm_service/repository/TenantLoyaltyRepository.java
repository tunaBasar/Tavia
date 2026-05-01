package com.tavia.crm_service.repository;

import com.tavia.crm_service.entity.TenantLoyalty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantLoyaltyRepository extends JpaRepository<TenantLoyalty, UUID> {
    List<TenantLoyalty> findByTenantId(UUID tenantId);
    List<TenantLoyalty> findByCustomerId(UUID customerId);
    Optional<TenantLoyalty> findByCustomerIdAndTenantId(UUID customerId, UUID tenantId);
}
