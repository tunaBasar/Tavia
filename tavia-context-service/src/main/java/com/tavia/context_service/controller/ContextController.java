package com.tavia.context_service.controller;

import com.tavia.context_service.dto.ApiResponse;
import com.tavia.context_service.dto.ContextDto;
import com.tavia.context_service.service.ContextService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/context")
@RequiredArgsConstructor
@Tag(name = "Context API", description = "Environmental context data provider")
public class ContextController {

    private final ContextService contextService;

    @GetMapping
    @Operation(summary = "Get current environmental context")
    public ResponseEntity<ApiResponse<ContextDto>> getCurrentContext() {
        ContextDto context = contextService.getCurrentContext();
        return ResponseEntity.ok(ApiResponse.success(context));
    }
}
