package com.example.likelion_ch.dto;

import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponse {
    private List<CartItemResponse> cartItems;
    private int totalOrderCards;
}
