package com.example.likelion_ch.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class TableOrderDto {
    private Long tableId;
    private List<OrderItemDto> items;

    @Getter
    @AllArgsConstructor
    public static class OrderItemDto {
        private String menuName;
        private int quantity;
        private int cardQuantity;
        private List<String> cardNames;
    }
}
