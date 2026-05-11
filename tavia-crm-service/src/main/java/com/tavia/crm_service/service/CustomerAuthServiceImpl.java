package com.tavia.crm_service.service;

import com.tavia.crm_service.config.PasswordHasher;
import com.tavia.crm_service.dto.*;
import com.tavia.crm_service.entity.City;
import com.tavia.crm_service.entity.Customer;
import com.tavia.crm_service.entity.TenantLoyalty;
import com.tavia.crm_service.exception.ResourceNotFoundException;
import com.tavia.crm_service.repository.CustomerRepository;
import com.tavia.crm_service.repository.TenantLoyaltyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerAuthServiceImpl implements CustomerAuthService {

    private final CustomerRepository customerRepository;
    private final TenantLoyaltyRepository tenantLoyaltyRepository;
    private final PasswordHasher passwordHasher;

    @Override
    public CustomerAuthResponse register(CustomerRegisterRequest request) {
        log.info("Registering customer with email: {}", request != null ? request.getEmail() : "null");

        if (request == null) {
            throw new IllegalArgumentException("Request payload cannot be null.");
        }

        // Guard Clause: Check email uniqueness early
        if (customerRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("A customer with this email already exists.");
        }

        // Guard Clause: Validate city (throws exception if invalid)
        City city = parseCity(request.getCity());

        Customer customer = Customer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordHasher.hash(request.getPassword()))
                .city(city)
                .build();

        Customer saved;
        try {
            saved = customerRepository.save(customer);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            log.error("Data integrity violation while saving customer: {}", request.getEmail(), e);
            throw new IllegalArgumentException("Database constraint violation occurred during registration.");
        }
        
        log.info("Customer registered with id: {}", saved.getId());

        return toAuthResponse(saved);
    }

    @Override
    public CustomerAuthResponse login(CustomerLoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        Customer customer = customerRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (!passwordHasher.verify(request.getPassword(), customer.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        log.info("Login successful for customer: {}", customer.getId());
        return toAuthResponse(customer);
    }

    @Override
    public void requestPasswordReset(ForgotPasswordRequest request) {
        log.info("Password reset requested for email: {}", request.getEmail());

        customerRepository.findByEmail(request.getEmail()).ifPresent(customer -> {
            String token = UUID.randomUUID().toString();
            customer.setResetToken(token);
            customer.setResetTokenExpiry(LocalDateTime.now().plusMinutes(30));
            customerRepository.save(customer);

            // Mock email — SMTP not configured; log the token to console
            log.info("========================================");
            log.info("MOCK EMAIL - Password Reset");
            log.info("To: {}", customer.getEmail());
            log.info("Subject: Tavia Password Reset");
            log.info("Your password reset token: {}", token);
            log.info("This token expires in 30 minutes.");
            log.info("========================================");
        });

        // Always return success to avoid email enumeration
        log.info("Password reset flow completed for email: {}", request.getEmail());
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        log.info("Attempting to reset password with token");

        Customer customer = customerRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token."));

        if (customer.getResetTokenExpiry() == null ||
                customer.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Invalid or expired reset token.");
        }

        customer.setPasswordHash(passwordHasher.hash(request.getNewPassword()));
        customer.setResetToken(null);
        customer.setResetTokenExpiry(null);
        customerRepository.save(customer);

        log.info("Password successfully reset for customer: {}", customer.getId());
    }

    @Override
    public void changePassword(UUID customerId, ChangePasswordRequest request) {
        log.info("Attempting to change password for customer: {}", customerId);

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (!passwordHasher.verify(request.getCurrentPassword(), customer.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        customer.setPasswordHash(passwordHasher.hash(request.getNewPassword()));
        customerRepository.save(customer);

        log.info("Password successfully changed for customer: {}", customer.getId());
    }

    @Override
    public List<TenantLoyaltyDto> getCustomerLoyalties(UUID customerId) {
        log.info("Fetching loyalties for customer: {}", customerId);

        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }

        List<TenantLoyalty> loyalties = tenantLoyaltyRepository.findByCustomerId(customerId);
        return loyalties.stream()
                .map(tl -> TenantLoyaltyDto.builder()
                        .id(tl.getId())
                        .tenantId(tl.getTenantId())
                        .loyaltyLevel(tl.getLoyaltyLevel())
                        .totalSpent(tl.getTotalSpent())
                        .build())
                .collect(Collectors.toList());
    }

    private CustomerAuthResponse toAuthResponse(Customer customer) {
        return CustomerAuthResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .email(customer.getEmail())
                .city(customer.getCity())
                .build();
    }

    private City parseCity(String city) {
        if (city == null || city.isBlank()) {
            throw new IllegalArgumentException("City is required and cannot be empty.");
        }
        try {
            return City.valueOf(city.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid city provided: " + city + ". Must be a valid City enum value.");
        }
    }
}
