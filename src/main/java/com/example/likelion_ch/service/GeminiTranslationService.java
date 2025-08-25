package com.example.likelion_ch.service;

import com.example.likelion_ch.dto.TranslationRequest;
import com.example.likelion_ch.dto.TranslationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiTranslationService {

    private final WebClient webClient;

    @Value("${google.gemini.api.base-url}")
    private String baseUrl;

    @Value("${google.gemini.api.key}")
    private String defaultApiKey;

    @Value("${google.gemini.api.timeout-ms:3000}")
    private long timeoutMs;

    @Value("${google.gemini.api.retry-count:1}")
    private int retryCount;

    public TranslationResponse translateToEnglish(TranslationRequest request, String userApiKey) {
        return translate(request, "영어", userApiKey);
    }

    public TranslationResponse translateToChinese(TranslationRequest request, String userApiKey) {
        return translate(request, "중국어", userApiKey);
    }

    public TranslationResponse translateToJapanese(TranslationRequest request, String userApiKey) {
        return translate(request, "일본어", userApiKey);
    }

    // MenuService에서 사용할 translate 메서드 추가
    public TranslationResponse translate(TranslationRequest request, String targetLanguage, String userApiKey) {
        Instant startTime = Instant.now();
        String apiKey = userApiKey != null ? userApiKey : defaultApiKey;
        
        String prompt = buildPrompt(request, targetLanguage);
        
        try {
            String translatedText = callGeminiApi(prompt, apiKey);
            
            long processingTime = java.time.Duration.between(startTime, Instant.now()).toMillis();
            
            return TranslationResponse.builder()
                    .originalText(request.getText())
                    .translatedText(translatedText)
                    .targetLanguage(targetLanguage)
                    .sourceLanguage("한국어")
                    .processingTimeMs(processingTime)
                    .build();
                    
        } catch (Exception e) {
            log.error("번역 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("번역 서비스 오류: " + e.getMessage());
        }
    }

    private String buildPrompt(TranslationRequest request, String targetLanguage) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("다음 한국어 텍스트를 ").append(targetLanguage).append("로 번역해주세요.\n\n");
        
        if (request.getMenuName() != null && !request.getMenuName().isEmpty()) {
            prompt.append("메뉴명: ").append(request.getMenuName()).append("\n");
        }
        
        if (request.getDescription() != null && !request.getDescription().isEmpty()) {
            prompt.append("메뉴 설명: ").append(request.getDescription()).append("\n");
        }
        
        prompt.append("번역할 텍스트: ").append(request.getText()).append("\n\n");
        prompt.append("번역 결과만 출력해주세요.");
        
        return prompt.toString();
    }

    private String callGeminiApi(String prompt, String apiKey) {
        GeminiRequest geminiRequest = GeminiRequest.builder()
                .contents(List.of(
                    GeminiContent.builder()
                        .parts(List.of(
                            GeminiPart.builder()
                                .text(prompt)
                                .build()
                        ))
                        .build()
                ))
                .build();

        return webClient.post()
                .uri(baseUrl + "?key=" + apiKey)
                .bodyValue(geminiRequest)
                .retrieve()
                .bodyToMono(GeminiResponse.class)
                .timeout(Duration.ofMillis(timeoutMs))
                .retry(retryCount)
                .map(response -> {
                    if (response.getCandidates() != null && !response.getCandidates().isEmpty()) {
                        return response.getCandidates().get(0).getContent().getParts().get(0).getText();
                    }
                    throw new RuntimeException("번역 결과를 찾을 수 없습니다.");
                })
                .block();
    }

    // Gemini API 요청/응답 DTO
    @lombok.Data
    @lombok.Builder
    public static class GeminiRequest {
        private List<GeminiContent> contents;
    }

    @lombok.Data
    @lombok.Builder
    public static class GeminiContent {
        private List<GeminiPart> parts;
    }

    @lombok.Data
    @lombok.Builder
    public static class GeminiPart {
        private String text;
    }

    @lombok.Data
    public static class GeminiResponse {
        private List<GeminiCandidate> candidates;
    }

    @lombok.Data
    public static class GeminiCandidate {
        private GeminiContent content;
    }
}
