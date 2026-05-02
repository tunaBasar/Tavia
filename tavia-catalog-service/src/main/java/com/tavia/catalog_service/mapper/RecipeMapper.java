package com.tavia.catalog_service.mapper;

import com.tavia.catalog_service.dto.RecipeDto;
import com.tavia.catalog_service.dto.RecipeIngredientDto;
import com.tavia.catalog_service.entity.Recipe;
import com.tavia.catalog_service.entity.RecipeIngredient;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * MapStruct mapper for Recipe ↔ RecipeDto conversions.
 * Per GEMINI.md §3.3: JPA entities are never exposed to the presentation layer.
 */
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RecipeMapper {

    RecipeDto toDto(Recipe entity);

    @Mapping(target = "ingredients", ignore = true)
    Recipe toEntity(RecipeDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ingredients", ignore = true)
    Recipe toEntity(com.tavia.catalog_service.dto.CreateRecipeRequest request);

    RecipeIngredientDto toIngredientDto(RecipeIngredient entity);

    @Mapping(target = "recipe", ignore = true)
    RecipeIngredient toIngredientEntity(RecipeIngredientDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "recipe", ignore = true)
    RecipeIngredient toIngredientEntity(com.tavia.catalog_service.dto.CreateRecipeIngredientRequest request);

    List<RecipeDto> toDtoList(List<Recipe> entities);

    List<RecipeIngredientDto> toIngredientDtoList(List<RecipeIngredient> entities);
}
