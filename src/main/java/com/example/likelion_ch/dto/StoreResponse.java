package com.example.likelion_ch.dto;

import com.example.likelion_ch.entity.Menu;
import com.example.likelion_ch.entity.StoreFeature;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
public class StoreResponse {
    private String restaurantName;
    private String restaurantAddress;
    private String shortDescription;
    private String longDescription;
    private List<FeatureResponse> features;
    private List<Menu> menuList;

    // 엔티티 기반 생성자
    public StoreResponse(String restaurantName, String restaurantAddress,
                         String shortDescription, String longDescription,
                         Set<StoreFeature> features, List<Menu> menuList) {
        this.restaurantName = restaurantName;
        this.restaurantAddress = restaurantAddress;
        this.shortDescription = shortDescription;
        this.longDescription = longDescription;
        if (features != null) {
            this.features = features.stream()
                    .map(f -> new FeatureResponse(f.getFeatureId(), f.getName()))
                    .toList();
        }
        this.menuList = menuList;
    }
}