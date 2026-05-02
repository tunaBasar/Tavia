package com.tavia.catalog_service.exception;

/**
 * Thrown when a requested resource is not found in the catalog.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
