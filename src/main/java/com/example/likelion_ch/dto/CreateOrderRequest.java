package com.example.likelion_ch.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateOrderRequest {
    private Long menuId;      // 주문할 메뉴 ID
    private int quantity;     // 주문 수량
    private String language;  // 주문 언어 (선택적)
}
