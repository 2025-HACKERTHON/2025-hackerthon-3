package com.example.likelion_ch.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String language; // 손님이 선택한 언어 (ENGLISH, CHINESE, JAPANESE)

    // 테이블에 앉은 손님 정보
    @ManyToOne
    @JoinColumn(name = "user_id")
    private SiteUser user; // 가게 주인
}
