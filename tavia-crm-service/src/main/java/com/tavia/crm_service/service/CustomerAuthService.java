package com.tavia.crm_service.service;

import com.tavia.crm_service.dto.*;

import java.util.List;
import java.util.UUID;

public interface CustomerAuthService {
    CustomerAuthResponse register(CustomerRegisterRequest request);
    CustomerAuthResponse login(CustomerLoginRequest request);
    void requestPasswordReset(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    List<TenantLoyaltyDto> getCustomerLoyalties(UUID customerId);
}
