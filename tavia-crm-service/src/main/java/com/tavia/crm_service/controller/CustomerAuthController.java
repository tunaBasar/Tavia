package com.tavia.crm_service.controller;

import com.tavia.crm_service.dto.*;
import com.tavia.crm_service.service.CustomerAuthService;
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
@RequestMapping("/api/v1/crm/auth")
@RequiredArgsConstructor
@Tag(name = "CRM Customer Auth API", description = "Customer authentication, registration, and password management")
public class CustomerAuthController {

    private final CustomerAuthService customerAuthService;

    @PostMapping("/register")
    @Operation(summary = "Register a new customer")
    public ResponseEntity<ApiResponse<CustomerAuthResponse>> register(
            @Valid @RequestBody CustomerRegisterRequest request) {
        CustomerAuthResponse response = customerAuthService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Login a customer")
    public ResponseEntity<ApiResponse<CustomerAuthResponse>> login(
            @Valid @RequestBody CustomerLoginRequest request) {
        CustomerAuthResponse response = customerAuthService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request a password reset token (mocked email)")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        customerAuthService.requestPasswordReset(request);
        return ResponseEntity.ok(ApiResponse.success(
                "If an account exists with that email, a reset link has been sent.", null));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using a valid token")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        customerAuthService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successful", null));
    }

    @GetMapping("/loyalties/{customerId}")
    @Operation(summary = "Get all tenant loyalties for a customer (profile screen)")
    public ResponseEntity<ApiResponse<List<TenantLoyaltyDto>>> getCustomerLoyalties(
            @PathVariable UUID customerId) {
        List<TenantLoyaltyDto> loyalties = customerAuthService.getCustomerLoyalties(customerId);
        return ResponseEntity.ok(ApiResponse.success(loyalties));
    }
}
