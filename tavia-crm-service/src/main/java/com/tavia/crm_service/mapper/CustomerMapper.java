package com.tavia.crm_service.mapper;

import com.tavia.crm_service.dto.CustomerDto;
import com.tavia.crm_service.entity.Customer;
import com.tavia.crm_service.entity.TenantLoyalty;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    @Mapping(source = "customer.id", target = "id")
    @Mapping(source = "loyalty.loyaltyLevel", target = "loyaltyLevel")
    @Mapping(source = "loyalty.totalSpent", target = "totalSpentInThisTenant")
    CustomerDto toDto(Customer customer, TenantLoyalty loyalty);

    Customer toEntity(CustomerDto dto);
}