package com.example.likelion_ch.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
public class MenuInfo {
    private Long menuId;
    private Long userId;
    private String nameKo;
    private Integer userMenuId;
    private String description;
    private BigDecimal price;
    private String language;
    private String imageUrl;  // S3에 업로드된 이미지의 접근 가능한 URL

    // JPQL 전용 생성자
    public MenuInfo(String nameKo, String description, BigDecimal price) {
        this.nameKo = nameKo;
        this.description = description;
        this.price = price;
    }

    public MenuInfo(String nameKo, String description, BigDecimal price, String imageUrl) {
        this.nameKo = nameKo;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
    }
}