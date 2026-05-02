package com.tavia.inventory_service.dto;

import com.tavia.inventory_service.enums.UnitType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RawMaterialDto {
    private UUID id;

    private UUID tenantId;

    @NotBlank(message = "Raw material name is required")
    private String name;

    @NotNull(message = "Unit type is required")
    private UnitType unit;

    @NotNull(message = "Stock quantity is required")
    @PositiveOrZero(message = "Stock quantity must be zero or positive")
    private Double stockQuantity;
}
