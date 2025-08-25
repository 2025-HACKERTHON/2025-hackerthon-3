package com.example.likelion_ch.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private int tableId;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> orderItems;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class OrderItemResponse {
        private Long id;
        private String menuName;
        private int quantity;
        private List<String> options; // 메뉴 옵션
    }
}
