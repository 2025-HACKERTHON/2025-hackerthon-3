package com.example.likelion_ch.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LanguageRatioResponse {
    private String language; // JAN, ENG, CHA, KO
    private double percentage; // 퍼센트 (예: 60.0)
}
