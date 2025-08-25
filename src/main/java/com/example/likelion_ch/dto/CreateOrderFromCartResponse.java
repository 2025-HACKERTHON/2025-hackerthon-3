package com.example.likelion_ch.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderFromCartResponse {
    private Long orderId;
    private String message;
    private int totalPrice;
}
