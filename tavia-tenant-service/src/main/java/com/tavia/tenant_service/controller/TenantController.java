package com.tavia.tenant_service.controller;

import com.tavia.tenant_service.dto.ApiResponse;
import com.tavia.tenant_service.dto.TenantCreateRequest;
import com.tavia.tenant_service.dto.TenantLoginRequest;
import com.tavia.tenant_service.dto.TenantResponse;
import com.tavia.tenant_service.entity.City;
import com.tavia.tenant_service.service.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tenants")
@RequiredArgsConstructor
public class TenantController {
    private final TenantService tenantService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<TenantResponse>> register(@RequestBody TenantCreateRequest request) {
        TenantResponse response = tenantService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Tenant basariyla olusturuldu."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TenantResponse>> login(@RequestBody TenantLoginRequest request) {
        TenantResponse response = tenantService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Giris basarili."));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TenantResponse>>> listTenants(
            @RequestParam(required = false) City city) {
        List<TenantResponse> responses;
        if (city != null) {
            responses = tenantService.listTenantsByCity(city);
        } else {
            responses = tenantService.listAllTenants();
        }
        return ResponseEntity.ok(ApiResponse.success(responses, "Tenant listesi getirildi."));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TenantResponse>> updateStatus(
            @PathVariable UUID id,
            @RequestParam boolean isActive) {
        TenantResponse response = tenantService.updateTenantStatus(id, isActive);
        return ResponseEntity.ok(ApiResponse.success(response, "Tenant durumu guncellendi."));
    }
}

