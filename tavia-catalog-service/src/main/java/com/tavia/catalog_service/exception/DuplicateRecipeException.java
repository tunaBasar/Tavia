package com.tavia.catalog_service.exception;

/**
 * Thrown when a recipe already exists for a given tenant and product name.
 * Prevents duplicate recipe creation within the same tenant scope.
 */
public class DuplicateRecipeException extends RuntimeException {
    public DuplicateRecipeException(String message) {
        super(message);
    }
}
