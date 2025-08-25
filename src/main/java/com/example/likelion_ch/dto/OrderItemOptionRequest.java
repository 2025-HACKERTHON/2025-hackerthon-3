package com.example.likelion_ch.dto;

import lombok.*;

import com.example.likelion_ch.entity.OrderItem;
import com.example.likelion_ch.entity.OrderItemOption;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemOptionRequest {
    private String name;
    private int extraPrice;

    public OrderItemOption toEntity(OrderItem orderItem) {
        return OrderItemOption.builder()
                .optionName(this.name)
                .orderItem(orderItem)
                .build();
    }
}
