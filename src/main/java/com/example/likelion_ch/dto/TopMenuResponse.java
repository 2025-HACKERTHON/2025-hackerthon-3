package com.example.likelion_ch.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class TopMenuResponse {
    private List<MenuInfo> topMenus;
}
