package com.tavia.iot_service.kafka.consumer;

import com.tavia.iot_service.kafka.dto.AiCommandEventDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiCommandEventListener {

    @KafkaListener(topics = "ai-commands", groupId = "iot-group")
    public void consumeAiCommand(AiCommandEventDto command) {
        if ("SCHEDULE_MAINTENANCE".equals(command.getCommandType())) {
            log.info("Received autonomous maintenance command from AI for machine {}", command.getTargetId());
            // TODO: Create a MachineTask in the database
        }
    }
}
