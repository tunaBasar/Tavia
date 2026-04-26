package com.tavia.crm_service.service;

import com.tavia.crm_service.dto.CreateCustomerRequest;
import com.tavia.crm_service.dto.CustomerDto;
import com.tavia.crm_service.dto.UpdateCustomerRequest;
import com.tavia.crm_service.entity.Customer;
import com.tavia.crm_service.entity.LoyaltyLevel;
import com.tavia.crm_service.exception.ResourceNotFoundException;
import com.tavia.crm_service.mapper.CustomerMapper;
import com.tavia.crm_service.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    @Override
    public CustomerDto createCustomer(CreateCustomerRequest request) {
        log.info("Creating customer with email: {}", request.getEmail());

        Customer customer = Customer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .totalSpent(request.getTotalSpent() != null ? request.getTotalSpent() : BigDecimal.ZERO)
                .loyaltyLevel(parseLoyaltyLevel(request.getLoyaltyLevel()))
                .build();

        Customer saved = customerRepository.save(customer);
        log.info("Customer created with id: {}", saved.getId());
        return customerMapper.toDto(saved);
    }

    @Override
    public CustomerDto getCustomerById(UUID id) {
        log.info("Fetching customer with id: {}", id);
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return customerMapper.toDto(customer);
    }

    @Override
    public List<CustomerDto> getAllCustomers() {
        log.info("Fetching all customers");
        return customerRepository.findAll().stream()
                .map(customerMapper::toDto)
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
        return customerMapper.toDto(updated);
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
}
