package com.tavia.crm_service.controller;

import com.tavia.crm_service.dto.ApiResponse;
import com.tavia.crm_service.dto.AdjustTenantLoyaltyRequest;
import com.tavia.crm_service.dto.CreateCustomerRequest;
import com.tavia.crm_service.dto.CustomerDto;
import com.tavia.crm_service.dto.UpdateCustomerRequest;
import com.tavia.crm_service.service.CustomerService;
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
@RequestMapping("/api/v1/crm/customers")
@RequiredArgsConstructor
@Tag(name = "CRM Customer API", description = "Customer management and loyalty tracking")
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    @Operation(summary = "Create a new customer")
    public ResponseEntity<ApiResponse<CustomerDto>> createCustomer(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @Valid @RequestBody CreateCustomerRequest request) {
        CustomerDto customer = customerService.createCustomer(request, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Customer created", customer));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID")
    public ResponseEntity<ApiResponse<CustomerDto>> getCustomerById(
            @PathVariable UUID id,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        CustomerDto customer = customerService.getCustomerById(id, tenantId);
        return ResponseEntity.ok(ApiResponse.success(customer));
    }

    @GetMapping
    @Operation(summary = "Get all customers for the active tenant")
    public ResponseEntity<ApiResponse<List<CustomerDto>>> getAllCustomers(
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        List<CustomerDto> customers = customerService.getAllCustomers(tenantId);
        return ResponseEntity.ok(ApiResponse.success(customers));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a customer")
    public ResponseEntity<ApiResponse<CustomerDto>> updateCustomer(
            @PathVariable UUID id,
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @Valid @RequestBody UpdateCustomerRequest request) {
        CustomerDto customer = customerService.updateCustomer(id, request, tenantId);
        return ResponseEntity.ok(ApiResponse.success("Customer updated", customer));
    }

    @PostMapping("/{id}/loyalty/adjust")
    @Operation(summary = "Adjust customer loyalty for a tenant after order completion")
    public ResponseEntity<ApiResponse<CustomerDto>> adjustTenantLoyalty(
            @PathVariable UUID id,
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @Valid @RequestBody AdjustTenantLoyaltyRequest request) {
        CustomerDto customer = customerService.adjustTenantLoyalty(id, tenantId, request.getOrderAmount());
        return ResponseEntity.ok(ApiResponse.success("Tenant loyalty adjusted", customer));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a customer")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable UUID id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(ApiResponse.success("Customer deleted", null));
    }
}
