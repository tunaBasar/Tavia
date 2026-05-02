package com.tavia.catalog_service.entity;

import com.tavia.catalog_service.enums.ProductCategory;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Represents a final product recipe (Bill of Materials) in the Tavia ecosystem.
 * Per GEMINI.md §2.2: A Recipe bridges the gap between a final product name
 * (e.g., "Latte") and the raw materials required to produce it.
 *
 * Each recipe is tenant-scoped — different tenants may have different formulations
 * for the same product name, allowing franchise-level customization.
 */
@Entity
@Table(name = "recipes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"tenant_id", "product_name"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    /**
     * The name of the final product this recipe produces (e.g., "Latte", "Espresso").
     * Normalized to UPPERCASE for case-insensitive matching during recipe resolution.
     */
    @Column(name = "product_name", nullable = false)
    private String productName;

    /**
     * Human-readable display name preserving original casing.
     * Used by the customer UI and dashboard.
     */
    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private ProductCategory category;

    /**
     * Optional description for the product — shown in the customer app.
     */
    @Column(name = "description", length = 500)
    private String description;

    /**
     * Whether this recipe is currently active and available for ordering.
     * Supports seasonal menu management and soft-delete semantics.
     */
    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    /**
     * The list of raw material ingredients required to produce ONE unit of this product.
     * Cascade ALL: recipe owns its ingredients entirely.
     * orphanRemoval: removing an ingredient from the list deletes it from the DB.
     */
    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<RecipeIngredient> ingredients = new ArrayList<>();

    // ── Domain helper ──────────────────────────────────────────────────

    /**
     * Adds an ingredient to this recipe, maintaining the bidirectional relationship.
     */
    public void addIngredient(RecipeIngredient ingredient) {
        ingredients.add(ingredient);
        ingredient.setRecipe(this);
    }

    /**
     * Removes an ingredient from this recipe, maintaining the bidirectional relationship.
     */
    public void removeIngredient(RecipeIngredient ingredient) {
        ingredients.remove(ingredient);
        ingredient.setRecipe(null);
    }
}
