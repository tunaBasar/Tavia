package com.tavia.iot_service.repository;

import com.tavia.iot_service.domain.MachineTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MachineTaskRepository extends JpaRepository<MachineTask, UUID> {
    Optional<MachineTask> findByIdAndTenantId(UUID id, UUID tenantId);
}
