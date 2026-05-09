package com.tavia.ai_service.service;

import java.util.UUID;

public interface FeatureStoreService {
    
    /**
     * Updates the latest state of a machine in the in-memory feature store.
     */
    void updateMachineState(UUID machineId, String telemetryJson);
    
    /**
     * Retrieves the latest machine state from the feature store.
     */
    String getMachineState(UUID machineId);
    
    /**
     * Increments the hourly sales counter for the sliding window analytics.
     */
    void incrementHourlySales(UUID tenantId, double revenue);
    
    /**
     * Gets the total revenue for the current sliding hour.
     */
    double getHourlySales(UUID tenantId);
}
