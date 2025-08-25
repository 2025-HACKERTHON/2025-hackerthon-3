package com.example.likelion_ch.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class TableResponse {
    private Long userId;
    private Long tableId;
    private LocalDateTime selectedAt;
}
