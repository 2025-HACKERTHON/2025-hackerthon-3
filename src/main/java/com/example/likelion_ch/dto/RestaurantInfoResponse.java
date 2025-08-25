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
public class RestaurantInfoResponse {
    private String restaurantName;
    private String restaurantAddress;
    private String shortDescription;
    private String longDescription;
    private Integer tableCount;
    private List<String> features;
}
