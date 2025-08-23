package com.example.likelion_ch.controller;

import com.example.likelion_ch.dto.LanguageRatioResponse;
import com.example.likelion_ch.service.LanguageStatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class LanguageStatController {

    private final LanguageStatService languageStatService;

    @GetMapping("/languages")
    public List<LanguageRatioResponse> getLanguageRatio(@RequestParam Long userId) {
        return languageStatService.getLanguageRatio(userId);
    }
}
