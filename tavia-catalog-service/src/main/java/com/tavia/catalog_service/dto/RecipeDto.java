package com.tavia.catalog_service.dto;

import com.tavia.catalog_service.enums.ProductCategory;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * DTO for creating or updating a Recipe (Bill of Materials).
 * Per GEMINI.md §3.3: JPA entities are NEVER exposed to the presentation layer.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeDto {

    private UUID id;

    /**
     * The product name — will be normalized to UPPERCASE for storage.
     * Must match the productName used in tavia-order-service's CreateOrderRequest.
     */
    @NotBlank(message = "Product name is required")
    private String productName;

    /**
     * Human-readable display name shown to customers (preserves original casing).
     */
    @NotBlank(message = "Display name is required")
    private String displayName;

    @NotNull(message = "Product category is required")
    private ProductCategory category;

    private String description;

    private BigDecimal price;

    private Boolean active;

    @NotEmpty(message = "At least one ingredient is required")
    @Valid
    private List<RecipeIngredientDto> ingredients;
}
