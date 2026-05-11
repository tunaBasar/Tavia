package com.tavia.ai_service.service;

import com.tavia.ai_service.dto.AiChatRequest;
import com.tavia.ai_service.dto.AiChatResponse;

import java.util.UUID;

public interface AiChatService {
    AiChatResponse processChat(UUID tenantId, AiChatRequest request);
}
