package com.tavia.crm_service.service;

import com.tavia.crm_service.dto.CreateCustomerRequest;
import com.tavia.crm_service.dto.CustomerDto;
import com.tavia.crm_service.dto.UpdateCustomerRequest;

import java.util.List;
import java.util.UUID;

public interface CustomerService {
    CustomerDto createCustomer(CreateCustomerRequest request);
    CustomerDto getCustomerById(UUID id);
    List<CustomerDto> getAllCustomers(UUID tenantId);
    CustomerDto updateCustomer(UUID id, UpdateCustomerRequest request);
    void deleteCustomer(UUID id);
}
