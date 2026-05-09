package com.tavia.ai_service.client.impl;

import com.tavia.ai_service.client.InferenceGrpcClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
public class MockInferenceGrpcClient implements InferenceGrpcClient {

    @Override
    public double predictFailureProbability(UUID machineId, String telemetryJson) {
        log.debug("Mocking gRPC call to Python ML Engine for machine: {}", machineId);
        
        // Simple mock rule: if telemetry has usageCount > 90, high probability
        if (telemetryJson != null && telemetryJson.contains("\"usageCount\":9")) {
            return 0.95;
        }
        return 0.05;
    }
}
