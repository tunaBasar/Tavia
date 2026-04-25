package com.tavia.inventory_service.controller;

import com.tavia.inventory_service.dto.ApiResponse;
import com.tavia.inventory_service.dto.InventoryItemDto;
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

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Inventory Management APIs")
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    @Operation(summary = "Add or update stock")
    public ResponseEntity<ApiResponse<InventoryItemDto>> addOrUpdateStock(@Valid @RequestBody InventoryItemDto inventoryItemDto) {
        InventoryItemDto savedDto = inventoryService.addOrUpdateStock(inventoryItemDto);
        return new ResponseEntity<>(ApiResponse.success(savedDto, "Stock added/updated successfully"), HttpStatus.CREATED);
    }

    @GetMapping("/tenant/{tenantId}")
    @Operation(summary = "Get inventory by tenant ID")
    public ResponseEntity<ApiResponse<List<InventoryItemDto>>> getInventoryByTenantId(@PathVariable UUID tenantId) {
        List<InventoryItemDto> items = inventoryService.getInventoryByTenantId(tenantId);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/tenant/{tenantId}/product/{productName}")
    @Operation(summary = "Get specific inventory item")
    public ResponseEntity<ApiResponse<InventoryItemDto>> getInventoryItem(
            @PathVariable UUID tenantId, 
            @PathVariable String productName) {
        InventoryItemDto item = inventoryService.getInventoryItem(tenantId, productName);
        return ResponseEntity.ok(ApiResponse.success(item));
    }
}
