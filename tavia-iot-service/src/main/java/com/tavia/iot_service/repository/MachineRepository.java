package com.tavia.iot_service.repository;

import com.tavia.iot_service.domain.Machine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MachineRepository extends JpaRepository<Machine, UUID> {
    Optional<Machine> findByIdAndTenantId(UUID id, UUID tenantId);
    List<Machine> findAllByTenantId(UUID tenantId);
}
