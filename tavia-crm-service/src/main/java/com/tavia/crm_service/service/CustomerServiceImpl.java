package com.tavia.crm_service.service;

import com.tavia.crm_service.dto.CreateCustomerRequest;
import com.tavia.crm_service.dto.CustomerDto;
import com.tavia.crm_service.dto.UpdateCustomerRequest;
import com.tavia.crm_service.entity.City;
import com.tavia.crm_service.entity.Customer;
import com.tavia.crm_service.entity.LoyaltyLevel;
import com.tavia.crm_service.entity.TenantLoyalty;
import com.tavia.crm_service.exception.ResourceNotFoundException;
import com.tavia.crm_service.mapper.CustomerMapper;
import com.tavia.crm_service.repository.CustomerRepository;
import com.tavia.crm_service.repository.TenantLoyaltyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final TenantLoyaltyRepository tenantLoyaltyRepository;
    private final CustomerMapper customerMapper;

    @Override
    public CustomerDto createCustomer(CreateCustomerRequest request) {
        log.info("Creating customer with email: {}", request.getEmail());

        City city = parseCity(request.getCity());
        if (city == null) {
            throw new IllegalArgumentException("City is required and must be a valid City enum value.");
        }

        Customer customer = Customer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .totalSpent(request.getTotalSpent() != null ? request.getTotalSpent() : BigDecimal.ZERO)
                .loyaltyLevel(parseLoyaltyLevel(request.getLoyaltyLevel()))
                .city(city)
                .build();

        Customer saved = customerRepository.save(customer);

        // If tenantId is provided, create TenantLoyalty mapping
        if (request.getTenantId() != null) {
            TenantLoyalty loyalty = TenantLoyalty.builder()
                    .customerId(saved.getId())
                    .tenantId(request.getTenantId())
                    .loyaltyLevel(LoyaltyLevel.BRONZE)
                    .totalSpentInThisTenant(BigDecimal.ZERO)
                    .build();
            tenantLoyaltyRepository.save(loyalty);
            log.info("TenantLoyalty created for customer {} in tenant {}", saved.getId(), request.getTenantId());
        }

        log.info("Customer created with id: {}", saved.getId());
        return mapToDto(saved, request.getTenantId());
    }

    @Override
    public CustomerDto getCustomerById(UUID id) {
        log.info("Fetching customer with id: {}", id);
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return mapToDto(customer, null);
    }

    @Override
    public List<CustomerDto> getAllCustomers(UUID tenantId) {
        log.info("Fetching customers, tenantId filter: {}", tenantId);

        if (tenantId != null) {
            // Fetch TenantLoyalty records for this tenant
            List<TenantLoyalty> loyalties = tenantLoyaltyRepository.findByTenantId(tenantId);
            if (loyalties.isEmpty()) {
                return Collections.emptyList();
            }

            // Extract customerIds and build lookup map
            Map<UUID, TenantLoyalty> loyaltyMap = loyalties.stream()
                    .collect(Collectors.toMap(TenantLoyalty::getCustomerId, tl -> tl));

            List<Customer> customers = customerRepository.findAllById(loyaltyMap.keySet());

            return customers.stream()
                    .map(customer -> {
                        TenantLoyalty tl = loyaltyMap.get(customer.getId());
                        return CustomerDto.builder()
                                .id(customer.getId())
                                .name(customer.getName())
                                .email(customer.getEmail())
                                .city(customer.getCity())
                                .loyaltyLevel(tl != null ? tl.getLoyaltyLevel() : customer.getLoyaltyLevel())
                                .totalSpentInThisTenant(tl != null ? tl.getTotalSpentInThisTenant() : BigDecimal.ZERO)
                                .build();
                    })
                    .collect(Collectors.toList());
        }

        // No tenantId filter — return all customers with their base data
        return customerRepository.findAll().stream()
                .map(customer -> CustomerDto.builder()
                        .id(customer.getId())
                        .name(customer.getName())
                        .email(customer.getEmail())
                        .city(customer.getCity())
                        .loyaltyLevel(customer.getLoyaltyLevel())
                        .totalSpentInThisTenant(customer.getTotalSpent())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public CustomerDto updateCustomer(UUID id, UpdateCustomerRequest request) {
        log.info("Updating customer with id: {}", id);
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        if (request.getName() != null) {
            customer.setName(request.getName());
        }
        if (request.getEmail() != null) {
            customer.setEmail(request.getEmail());
        }
        if (request.getTotalSpent() != null) {
            customer.setTotalSpent(request.getTotalSpent());
        }
        if (request.getLoyaltyLevel() != null) {
            customer.setLoyaltyLevel(parseLoyaltyLevel(request.getLoyaltyLevel()));
        }

        Customer updated = customerRepository.save(customer);
        log.info("Customer updated with id: {}", updated.getId());
        return mapToDto(updated, null);
    }

    @Override
    public void deleteCustomer(UUID id) {
        log.info("Deleting customer with id: {}", id);
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer not found with id: " + id);
        }
        customerRepository.deleteById(id);
        log.info("Customer deleted with id: {}", id);
    }

    private CustomerDto mapToDto(Customer customer, UUID tenantId) {
        LoyaltyLevel level = customer.getLoyaltyLevel();
        BigDecimal spent = customer.getTotalSpent();

        if (tenantId != null) {
            Optional<TenantLoyalty> tlOpt = tenantLoyaltyRepository
                    .findByCustomerIdAndTenantId(customer.getId(), tenantId);
            if (tlOpt.isPresent()) {
                level = tlOpt.get().getLoyaltyLevel();
                spent = tlOpt.get().getTotalSpentInThisTenant();
            }
        }

        return CustomerDto.builder()
                .id(customer.getId())
                .name(customer.getName())
                .email(customer.getEmail())
                .city(customer.getCity())
                .loyaltyLevel(level)
                .totalSpentInThisTenant(spent)
                .build();
    }

    private LoyaltyLevel parseLoyaltyLevel(String level) {
        if (level == null || level.isBlank()) {
            return LoyaltyLevel.BRONZE;
        }
        try {
            return LoyaltyLevel.valueOf(level.toUpperCase());
        } catch (IllegalArgumentException e) {
            return LoyaltyLevel.BRONZE;
        }
    }

    private City parseCity(String city) {
        if (city == null || city.isBlank()) {
            return null;
        }
        try {
            return City.valueOf(city.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
