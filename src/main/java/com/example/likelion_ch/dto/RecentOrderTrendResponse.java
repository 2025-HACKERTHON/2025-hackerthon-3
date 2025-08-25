package com.example.likelion_ch.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;

@Getter
@AllArgsConstructor
public class RecentOrderTrendResponse {

    private NationalityRatio nationalityRatio; // 전체 국적 비율
    private List<MenuInfo> top3Japanese;      // 일본인 Top3
    private List<MenuInfo> top3Chinese;       // 중국인 Top3
    private List<MenuInfo> top3English;       // 영어권 Top3

    @Getter
    @AllArgsConstructor
    public static class NationalityRatio {
        private long japanese;
        private long chinese;
        private long english;
        private long total;
    }

    @Getter
    @AllArgsConstructor
    public static class MenuInfo {
        private String menuName;
        private int quantity;
    }
}
