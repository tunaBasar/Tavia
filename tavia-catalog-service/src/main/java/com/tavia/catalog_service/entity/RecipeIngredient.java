package com.tavia.catalog_service.entity;

import com.tavia.catalog_service.enums.UnitType;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Represents a single raw material ingredient within a Recipe (Bill of Materials).
 * Per GEMINI.md §2.2: This is the bridge element — each ingredient references
 * a raw material by NAME (not by JPA relationship) to the inventory service.
 *
 * Quantities represent the amount needed for ONE unit of the parent recipe's product.
 * The order-service or IoT service will scale by order quantity at runtime.
 */
@Entity
@Table(name = "recipe_ingredients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeIngredient {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * The name of the raw material in the inventory service.
     * Per GEMINI.md §3.2: ID-based or name-based cross-referencing only,
     * no direct JPA @ManyToOne across microservice boundaries.
     */
    @Column(name = "raw_material_name", nullable = false)
    private String rawMaterialName;

    /**
     * Quantity of raw material required for ONE unit of the parent product.
     * Example: 200.0 ml of Milk for one Latte.
     */
    @Column(name = "quantity", nullable = false)
    private Double quantity;

    /**
     * Unit of measurement — must align with the UnitType enum in tavia-inventory-service.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "unit", nullable = false)
    private UnitType unit;

    /**
     * Owning Recipe. This is a SAME-SERVICE JPA relationship (allowed).
     * Cross-service references to inventory raw materials use name-based referencing.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;
}
