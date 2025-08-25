// StoreMenusResponse.java
package com.example.likelion_ch.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Builder;

import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class StoreMenusResponse {
    private List<MenuSummary> menus;

    @Getter
    @AllArgsConstructor
    @Builder
    public static class MenuSummary {
        private String menuName;
        private String shortDescription;
    }
}