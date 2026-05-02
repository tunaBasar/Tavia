package com.tavia.inventory_service.entity;

import com.tavia.inventory_service.enums.UnitType;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Represents a raw material tracked in the inventory.
 * Per GEMINI.md §2.2: Inventory tracks ONLY raw materials (e.g., Milk in ml, Coffee Beans in grams).
 * It NEVER tracks final sold products like "Latte".
 */
@Entity
@Table(name = "raw_materials", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"tenant_id", "name"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RawMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UnitType unit;

    @Column(name = "stock_quantity", nullable = false)
    private Double stockQuantity;
}
