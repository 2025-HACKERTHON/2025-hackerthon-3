package com.example.likelion_ch.dto;

import lombok.*;
import java.util.Map;
import java.util.HashMap;
import java.util.Map;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddCartItemRequest {
    private Long tableId;
    private Long menuId;
    @Builder.Default
    private Map<String, String> options = new HashMap<>();//빼기", "소스": "따로" }
}
