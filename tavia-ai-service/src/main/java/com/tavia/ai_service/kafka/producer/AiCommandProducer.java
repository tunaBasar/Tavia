package com.tavia.ai_service.kafka.producer;

import com.tavia.ai_service.kafka.dto.AiCommandEventDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiCommandProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String TOPIC = "ai-commands";

    public void sendCommand(AiCommandEventDto command) {
        log.info("AI emitting command [{}]: {}", command.getCommandType(), command.getTargetId());
        kafkaTemplate.send(TOPIC, command.getTargetId().toString(), command);
    }
}
