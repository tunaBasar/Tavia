package com.tavia.inventory_service.repository;

import com.tavia.inventory_service.entity.RawMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RawMaterialRepository extends JpaRepository<RawMaterial, UUID> {
    Optional<RawMaterial> findByTenantIdAndName(UUID tenantId, String name);
    List<RawMaterial> findAllByTenantId(UUID tenantId);
}
