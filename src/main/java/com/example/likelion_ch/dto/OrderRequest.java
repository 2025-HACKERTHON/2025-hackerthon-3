package com.example.likelion_ch.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

// 주문 생성 요청 DTO
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequest {

    private Long tableId; // QR 테이블 번호
    private List<OrderItemRequest> items;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemRequest {
        private Long menuId;          // 주문할 메뉴 ID
        private int quantity;         // 수량
        private BigDecimal price;     // 메뉴 가격
        private String language;      // 필요시
        private int cardQuantity;     // 옵션 카드 수량
        private String cardNames;     // 옵션 카드 이름
        private List<String> options; // 옵션 이름 리스트
    }
}
