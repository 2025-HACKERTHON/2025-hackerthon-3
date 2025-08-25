package com.example.likelion_ch.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuRequest {

    @NotBlank(message = "메뉴명을 입력해주세요")
    @Size(min = 1, max = 100, message = "메뉴명은 1자 이상 100자 이하여야 합니다")
    private String menuName;

    @Size(max = 500, message = "메뉴 설명은 500자를 초과할 수 없습니다")
    private String menuDescription;

    @NotNull(message = "가격을 입력해주세요")
    @Positive(message = "가격은 0보다 커야 합니다")
    private BigDecimal menuPrice;

    @Builder.Default
    private String language="ko";
}
