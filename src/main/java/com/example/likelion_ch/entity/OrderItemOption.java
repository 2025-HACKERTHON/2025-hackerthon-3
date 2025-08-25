package com.example.likelion_ch.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_item_options")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String optionName;

    @ManyToOne
    @JoinColumn(name = "order_item_id")
    private OrderItem orderItem;
}
