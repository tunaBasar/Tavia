package com.tavia.crm_service.service;

import com.tavia.crm_service.dto.CreateCustomerRequest;
import com.tavia.crm_service.dto.CustomerDto;
import com.tavia.crm_service.dto.UpdateCustomerRequest;
import com.tavia.crm_service.entity.City;
import com.tavia.crm_service.entity.Customer;
import com.tavia.crm_service.entity.LoyaltyLevel;
import com.tavia.crm_service.entity.TenantLoyalty;
import com.tavia.crm_service.exception.ResourceNotFoundException;
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

    @Override
    public CustomerDto createCustomer(CreateCustomerRequest request, UUID tenantId) {
        log.info("Creating customer with email: {}", request.getEmail());

        City city = parseCity(request.getCity());
        if (city == null) {
            throw new IllegalArgumentException("City is required and must be a valid City enum value.");
        }

        Customer customer = Customer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .city(city)
                .build();

        Customer saved = customerRepository.save(customer);

        getOrCreateTenantLoyalty(saved.getId(), tenantId);

        log.info("Customer created with id: {}", saved.getId());
        return mapToDto(saved, tenantId);
    }

    @Override
    public CustomerDto getCustomerById(UUID id, UUID tenantId) {
        log.info("Fetching customer with id: {} for tenant: {}", id, tenantId);
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return mapToDto(customer, tenantId);
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
                        return mapToDto(customer, tenantId);
                    })
                    .collect(Collectors.toList());
        }

        return Collections.emptyList();
    }

    @Override
    public CustomerDto updateCustomer(UUID id, UpdateCustomerRequest request, UUID tenantId) {
        log.info("Updating customer with id: {}", id);
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        if (request.getName() != null) {
            customer.setName(request.getName());
        }
        if (request.getEmail() != null) {
            customer.setEmail(request.getEmail());
        }
        if (request.getCity() != null) {
            City city = parseCity(request.getCity());
            if (city == null) {
                throw new IllegalArgumentException("City must be a valid City enum value.");
            }
            customer.setCity(city);
        }

        Customer updated = customerRepository.save(customer);
        log.info("Customer updated with id: {}", updated.getId());
        return mapToDto(updated, tenantId);
    }

    @Override
    public CustomerDto adjustTenantLoyalty(UUID customerId, UUID tenantId, BigDecimal orderAmount) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));

        TenantLoyalty tenantLoyalty = getOrCreateTenantLoyalty(customerId, tenantId);
        BigDecimal nextTotal = tenantLoyalty.getTotalSpent().add(orderAmount);
        tenantLoyalty.setTotalSpent(nextTotal);
        tenantLoyalty.setLoyaltyLevel(resolveLoyaltyLevel(nextTotal));
        tenantLoyaltyRepository.save(tenantLoyalty);

        return mapToDto(customer, tenantId);
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
        TenantLoyalty tenantLoyalty = getOrCreateTenantLoyalty(customer.getId(), tenantId);

        return CustomerDto.builder()
                .id(customer.getId())
                .name(customer.getName())
                .email(customer.getEmail())
                .city(customer.getCity())
                .tenantId(tenantId)
                .loyaltyLevel(tenantLoyalty.getLoyaltyLevel())
                .totalSpentInThisTenant(tenantLoyalty.getTotalSpent())
                .build();
    }

    private TenantLoyalty getOrCreateTenantLoyalty(UUID customerId, UUID tenantId) {
        if (tenantId == null) {
            throw new IllegalArgumentException("X-Tenant-ID header is required.");
        }
        return tenantLoyaltyRepository.findByCustomerIdAndTenantId(customerId, tenantId)
                .orElseGet(() -> tenantLoyaltyRepository.save(
                        TenantLoyalty.builder()
                                .customerId(customerId)
                                .tenantId(tenantId)
                                .loyaltyLevel(LoyaltyLevel.BRONZE)
                                .totalSpent(BigDecimal.ZERO)
                                .build()
                ));
    }

    private LoyaltyLevel resolveLoyaltyLevel(BigDecimal totalSpent) {
        if (totalSpent.compareTo(new BigDecimal("50000")) >= 0) {
            return LoyaltyLevel.PLATINUM;
        }
        if (totalSpent.compareTo(new BigDecimal("20000")) >= 0) {
            return LoyaltyLevel.GOLD;
        }
        if (totalSpent.compareTo(new BigDecimal("5000")) >= 0) {
            return LoyaltyLevel.SILVER;
        }
        return LoyaltyLevel.BRONZE;
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
