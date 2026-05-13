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

/**
 * DTO for creating a new Recipe (Bill of Materials).
 * Does not expose or accept an 'id' field, enforcing server-side ID generation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRecipeRequest {

    @NotBlank(message = "Product name is required")
    private String productName;

    @NotBlank(message = "Display name is required")
    private String displayName;

    @NotNull(message = "Product category is required")
    private ProductCategory category;

    private String description;

    private BigDecimal price;

    private Boolean active;

    @NotEmpty(message = "At least one ingredient is required")
    @Valid
    private List<CreateRecipeIngredientRequest> ingredients;
}
