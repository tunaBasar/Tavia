package com.tavia.inventory_service.controller;

import com.tavia.inventory_service.dto.ApiResponse;
import com.tavia.inventory_service.dto.DeductionRequest;
import com.tavia.inventory_service.dto.RawMaterialDto;
import com.tavia.inventory_service.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for the Tavia Inventory Service.
 * Per GEMINI.md §3.2: All tenant-scoped endpoints use @RequestHeader("X-Tenant-ID").
 * Per GEMINI.md §2.2: This service tracks ONLY raw materials, never final products.
 */
@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory — Raw Materials", description = "Raw Material Management APIs (DDD)")
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    @Operation(summary = "Add or update raw material stock")
    public ResponseEntity<ApiResponse<RawMaterialDto>> addOrUpdateStock(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @Valid @RequestBody RawMaterialDto rawMaterialDto) {
        RawMaterialDto saved = inventoryService.addOrUpdateStock(tenantId, rawMaterialDto);
        return new ResponseEntity<>(ApiResponse.success(saved, "Raw material stock added/updated successfully"), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all raw materials for the active tenant")
    public ResponseEntity<ApiResponse<List<RawMaterialDto>>> getRawMaterials(
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        List<RawMaterialDto> items = inventoryService.getRawMaterialsByTenantId(tenantId);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/{name}")
    @Operation(summary = "Get a specific raw material by name")
    public ResponseEntity<ApiResponse<RawMaterialDto>> getRawMaterial(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @PathVariable String name) {
        RawMaterialDto item = inventoryService.getRawMaterial(tenantId, name);
        return ResponseEntity.ok(ApiResponse.success(item));
    }

    /**
     * Batch deduction endpoint — called by order-service (or IoT service in the future)
     * after recipe resolution translates a product order into raw material quantities.
     */
    @PostMapping("/deduct")
    @Operation(summary = "Batch deduct raw materials (recipe-based)")
    public ResponseEntity<ApiResponse<Void>> deductBatch(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @Valid @RequestBody DeductionRequest request) {
        inventoryService.deductBatch(tenantId, request.getItems());
        return ResponseEntity.ok(ApiResponse.success(null, "Raw materials deducted successfully"));
    }

    // ── Legacy compatibility endpoints (tenant in path) ────────────────

    @GetMapping("/tenant/{tenantId}")
    @Operation(summary = "[Legacy] Get raw materials by tenant ID in path")
    public ResponseEntity<ApiResponse<List<RawMaterialDto>>> getRawMaterialsByPath(@PathVariable UUID tenantId) {
        List<RawMaterialDto> items = inventoryService.getRawMaterialsByTenantId(tenantId);
        return ResponseEntity.ok(ApiResponse.success(items));
    }
}
