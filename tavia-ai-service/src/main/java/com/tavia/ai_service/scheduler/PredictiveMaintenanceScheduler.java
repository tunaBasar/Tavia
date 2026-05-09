package com.tavia.ai_service.scheduler;

import com.tavia.ai_service.client.InferenceGrpcClient;
import com.tavia.ai_service.kafka.dto.AiCommandEventDto;
import com.tavia.ai_service.kafka.producer.AiCommandProducer;
import com.tavia.ai_service.service.FeatureStoreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class PredictiveMaintenanceScheduler {

    private final FeatureStoreService featureStoreService;
    private final InferenceGrpcClient inferenceClient;
    private final AiCommandProducer commandProducer;

    // Evaluates machine states every 5 minutes
    @Scheduled(fixedRate = 300000)
    public void evaluateMachineHealth() {
        log.info("Running scheduled Predictive Maintenance evaluation...");
        
        // In a real scenario, we would iterate over all active machines.
        // For this mock, we just demonstrate the pipeline with a dummy machine ID.
        UUID mockMachineId = UUID.randomUUID();
        String state = featureStoreService.getMachineState(mockMachineId);
        
        if (state != null) {
            double failureProb = inferenceClient.predictFailureProbability(mockMachineId, state);
            if (failureProb > 0.90) {
                log.warn("Machine {} has high failure probability ({}). Emitting maintenance command.", mockMachineId, failureProb);
                commandProducer.sendCommand(AiCommandEventDto.builder()
                        .tenantId(UUID.randomUUID()) // Mock tenant
                        .targetId(mockMachineId)
                        .commandType("SCHEDULE_MAINTENANCE")
                        .payloadJson("{\"reason\":\"ML Prediction > 90%\"}")
                        .build());
            }
        }
    }
}
