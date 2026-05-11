package com.tavia.ai_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class AiChatRequest {
    @NotNull(message = "Customer ID is required")
    private UUID customerId;

    @NotBlank(message = "Message is required")
    private String message;
}
