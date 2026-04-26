package com.tavia.ai_service.domain;

import com.tavia.ai_service.enums.LoyaltyLevel;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "daily_sales")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailySales {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID tenantId;

    @Column(nullable = false)
    private BigDecimal totalRevenue;

    @Column(nullable = false)
    private Integer totalOrders;

    @Column(nullable = false)
    private LocalDate reportDate;

    // New enrichment fields
    private String weather;

    @Enumerated(EnumType.STRING)
    private LoyaltyLevel loyaltyLevel;

    private String eventType;
}
