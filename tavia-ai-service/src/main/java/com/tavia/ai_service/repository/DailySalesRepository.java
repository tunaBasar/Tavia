package com.tavia.ai_service.repository;

import com.tavia.ai_service.domain.DailySales;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DailySalesRepository extends JpaRepository<DailySales, UUID> {
    Optional<DailySales> findByTenantIdAndReportDate(UUID tenantId, LocalDate reportDate);
    List<DailySales> findByTenantIdAndReportDateBetween(UUID tenantId, LocalDate start, LocalDate end);
}
