package com.example.likelion_ch.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TranslationRequest {
    
    @NotBlank(message = "번역할 텍스트를 입력해주세요")
    @Size(max = 500, message = "번역할 텍스트는 500자를 초과할 수 없습니다")
    private String text;
    
    @Size(max = 100, message = "메뉴명은 100자를 초과할 수 없습니다")
    private String menuName;
    
    @Size(max = 500, message = "메뉴 설명은 500자를 초과할 수 없습니다")
    private String description;

    public TranslationRequest(String text) {
        this.text = text;
    }
}
