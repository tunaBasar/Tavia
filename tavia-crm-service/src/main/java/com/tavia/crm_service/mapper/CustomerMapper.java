package com.tavia.crm_service.mapper;

import com.tavia.crm_service.dto.CustomerDto;
import com.tavia.crm_service.entity.Customer;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CustomerMapper {
    CustomerDto toDto(Customer customer);
    Customer toEntity(CustomerDto dto);
}
