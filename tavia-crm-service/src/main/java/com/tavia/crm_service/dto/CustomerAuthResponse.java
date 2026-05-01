package com.tavia.crm_service.dto;

import com.tavia.crm_service.entity.City;
import lombok.*;

import java.util.UUID;

/**
 * Lightweight DTO returned after successful authentication.
 * Does NOT include loyalty data — loyalty is per-tenant and fetched separately.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerAuthResponse {
    private UUID id;
    private String name;
    private String email;
    private City city;
}
