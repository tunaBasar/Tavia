package com.tavia.ai_service.client;

import java.util.UUID;

public interface InferenceGrpcClient {
    
    /**
     * Calls the external Python ML engine via gRPC to get the failure probability of a machine.
     * @param telemetryJson The feature vector (latest sliding window state).
     * @return Double representing failure probability (0.0 to 1.0)
     */
    double predictFailureProbability(UUID machineId, String telemetryJson);
}
