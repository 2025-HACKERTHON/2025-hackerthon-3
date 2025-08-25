package com.example.likelion_ch.controller;

import com.example.likelion_ch.service.MenuStatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class MenuStatController {

    private final MenuStatService menuStatService;


    // 예: /menus/top3/1/ko
    @GetMapping("/menus/top3/{userId}/{language}")
    public List<String> getTop3Menus(@PathVariable Long userId,
                                     @PathVariable String language) {
        return menuStatService.getTop3MenusByUserAndLanguage(userId, language);
    }
}