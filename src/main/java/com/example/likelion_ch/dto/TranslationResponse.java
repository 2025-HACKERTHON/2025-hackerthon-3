package com.example.likelion_ch.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TranslationResponse {
    
    private String originalText;
    private String translatedText;
    private String targetLanguage;
    private String sourceLanguage;
    private Long processingTimeMs;
}
