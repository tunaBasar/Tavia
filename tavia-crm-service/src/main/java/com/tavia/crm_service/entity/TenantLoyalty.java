package com.tavia.crm_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "tenant_loyalty")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantLoyalty {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID customerId;

    @Column(nullable = false)
    private UUID tenantId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private LoyaltyLevel loyaltyLevel = LoyaltyLevel.BRONZE;

    @Column(nullable = false)
    @Builder.Default
    private BigDecimal totalSpentInThisTenant = BigDecimal.ZERO;
}
