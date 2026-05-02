package com.tavia.catalog_service.repository;

import com.tavia.catalog_service.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Recipe entities.
 * All queries are tenant-scoped per GEMINI.md §3.2.
 */
@Repository
public interface RecipeRepository extends JpaRepository<Recipe, UUID> {

    /**
     * Find all recipes belonging to a specific tenant.
     */
    List<Recipe> findByTenantId(UUID tenantId);

    /**
     * Find all active recipes for a tenant.
     */
    List<Recipe> findByTenantIdAndActiveTrue(UUID tenantId);

    /**
     * Find a specific recipe by tenant and normalized product name.
     * Used for recipe resolution during order processing.
     */
    Optional<Recipe> findByTenantIdAndProductName(UUID tenantId, String productName);

    /**
     * Check if a recipe exists for a given tenant and product name.
     */
    boolean existsByTenantIdAndProductName(UUID tenantId, String productName);
}
