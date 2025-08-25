package com.example.likelion_ch.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponse {

    private Long menuId;
    private String menuName;
    private String menuDescription;
    private int unitPrice;
    private int orderCardCount;
    private int totalPrice;
    private List<OptionResponse> options;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OptionResponse {
        private String optionName;
        private String optionValue;
    }
}