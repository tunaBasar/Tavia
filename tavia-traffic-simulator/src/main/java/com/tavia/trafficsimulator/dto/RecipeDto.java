package com.tavia.trafficsimulator.dto;

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
public class RecipeDto {
    private UUID id;
    private String productName;
    private String displayName;
    private String category;
    private String description;
    private Boolean active;
    private List<RecipeIngredientDto> ingredients;
}
