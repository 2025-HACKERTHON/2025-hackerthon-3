package com.example.likelion_ch.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddCartItemResponse {
    private Long menuId;
    private int orderCardCount;    // 메뉴별 주문카드 수량
    private int totalOrderCards;   // 전체 장바구니 주문카드 수
}
