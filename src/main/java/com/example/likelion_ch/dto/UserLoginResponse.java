package com.example.likelion_ch.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserLoginResponse {
    private Long id;
    private String restaurantName;
    private String email;
    private Integer tableCount;
}
