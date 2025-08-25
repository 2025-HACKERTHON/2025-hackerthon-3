package com.example.likelion_ch.dto;

import com.example.likelion_ch.entity.RestaurantInfo;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class MenuResponse {
    private Long id;
    private Integer userMenuId;
    private String nameKo;
    private String nameEn;
    private String nameJa;
    private String nameCh;
    private String description;
    private String descriptionEn;
    private String descriptionJa;
    private String descriptionCh;
    private BigDecimal price;
    private String imageUrl;
    private Long version;
    private Instant createdAt;
    private Instant updatedAt;
    private Long userId;
    private String language;

    private RestaurantInfo restaurantInfo;
    private List<MenuInfo> menuList;

}
