package com.tavia.ai_service.controller;

import com.tavia.ai_service.common.ApiResponse;
import com.tavia.ai_service.dto.AiChatRequest;
import com.tavia.ai_service.dto.AiChatResponse;
import com.tavia.ai_service.service.AiChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai/chat")
@RequiredArgsConstructor
@Tag(name = "AI Chat API", description = "Endpoints for customer-facing AI Assistant")
public class AiChatController {

    private final AiChatService aiChatService;

    @PostMapping
    @Operation(summary = "Send a message to the AI Assistant")
    public ResponseEntity<ApiResponse<AiChatResponse>> chat(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @Valid @RequestBody AiChatRequest request) {
        
        AiChatResponse response = aiChatService.processChat(tenantId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
