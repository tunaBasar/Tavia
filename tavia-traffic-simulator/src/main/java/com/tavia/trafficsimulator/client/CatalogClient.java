package com.tavia.trafficsimulator.client;

import com.tavia.trafficsimulator.dto.ApiResponse;
import com.tavia.trafficsimulator.dto.RecipeDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;

@FeignClient(name = "tavia-catalog-service")
public interface CatalogClient {
    @GetMapping("/api/v1/catalog/recipes/active")
    ApiResponse<List<RecipeDto>> getActiveRecipes(@RequestHeader("X-Tenant-ID") String tenantId);
}
