package com.tavia.ai_service.client;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class GeminiApiClient {

    private final RestClient restClient;

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Value("${gemini.api.key}")
    private String apiKey;

    public GeminiApiClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    public String generateContent(String systemInstructionText, String userMessage) {
        GeminiRequest request = new GeminiRequest();
        
        GeminiRequest.Part instructionPart = new GeminiRequest.Part(systemInstructionText);
        GeminiRequest.SystemInstruction instruction = new GeminiRequest.SystemInstruction(List.of(instructionPart));
        request.setSystem_instruction(instruction);

        GeminiRequest.Part userPart = new GeminiRequest.Part(userMessage);
        GeminiRequest.Content userContent = new GeminiRequest.Content("user", List.of(userPart));
        request.setContents(List.of(userContent));

        GeminiResponse response = restClient.post()
                .uri(apiUrl + "?key=" + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(GeminiResponse.class);

        if (response != null && response.getCandidates() != null && !response.getCandidates().isEmpty()) {
            return response.getCandidates().get(0).getContent().getParts().get(0).getText();
        }
        
        return "Sorry, I could not generate a response at this time.";
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeminiRequest {
        private List<Content> contents;
        private SystemInstruction system_instruction;

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Content {
            private String role;
            private List<Part> parts;
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class SystemInstruction {
            private List<Part> parts;
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Part {
            private String text;
        }
    }

    @Data
    public static class GeminiResponse {
        private List<Candidate> candidates;

        @Data
        public static class Candidate {
            private Content content;
        }

        @Data
        public static class Content {
            private List<Part> parts;
            private String role;
        }

        @Data
        public static class Part {
            private String text;
        }
    }
}
