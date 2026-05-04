package com.tavia.trafficsimulator.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.tavia.trafficsimulator.enums.UnitType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class RecipeIngredientDto {
    private UUID id;
    private String rawMaterialName;
    private Double quantity;
    private UnitType unit;
}
