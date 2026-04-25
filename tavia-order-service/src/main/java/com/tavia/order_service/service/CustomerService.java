package com.tavia.order_service.service;

import com.tavia.order_service.dto.CreateCustomerRequest;
import com.tavia.order_service.dto.CustomerDto;

import java.util.List;
import java.util.UUID;

public interface CustomerService {
    CustomerDto createCustomer(CreateCustomerRequest request);
    CustomerDto getCustomerById(UUID id);
    List<CustomerDto> getAllCustomers();
}
