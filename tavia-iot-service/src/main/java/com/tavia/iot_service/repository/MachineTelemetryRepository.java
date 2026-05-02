package com.tavia.iot_service.repository;

import com.tavia.iot_service.domain.MachineTelemetry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface MachineTelemetryRepository extends JpaRepository<MachineTelemetry, UUID> {
}
