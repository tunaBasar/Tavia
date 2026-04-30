package com.tavia.crm_service.service;

import com.tavia.crm_service.dto.CreateCustomerRequest;
import com.tavia.crm_service.dto.CustomerDto;
import com.tavia.crm_service.dto.UpdateCustomerRequest;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface CustomerService {
    CustomerDto createCustomer(CreateCustomerRequest request, UUID tenantId);
    CustomerDto getCustomerById(UUID id, UUID tenantId);
    List<CustomerDto> getAllCustomers(UUID tenantId);
    CustomerDto updateCustomer(UUID id, UpdateCustomerRequest request, UUID tenantId);
    CustomerDto adjustTenantLoyalty(UUID customerId, UUID tenantId, BigDecimal orderAmount);
    void deleteCustomer(UUID id);
}
