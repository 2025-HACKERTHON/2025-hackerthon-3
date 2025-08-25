package com.example.likelion_ch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuWithRestaurantResponse {
    private RestaurantInfoResponse restaurantInfo;
    private List<MenuInfo> menuList;
}
