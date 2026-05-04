package com.tavia.trafficsimulator.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.tavia.trafficsimulator.enums.ProductCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class RecipeDto {
    private UUID id;
    private String productName;
    private String displayName;
    private ProductCategory category;
    private String description;
    private Boolean active;
    private List<RecipeIngredientDto> ingredients;
}
