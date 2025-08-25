package com.example.likelion_ch.controller;

import com.example.likelion_ch.dto.AddCartItemRequest;
import com.example.likelion_ch.dto.AddCartItemResponse;
import com.example.likelion_ch.dto.CartResponse;
import com.example.likelion_ch.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // 장바구니 조회
    @GetMapping
    public CartResponse getCart(@RequestParam Long tableId) {
        return cartService.getCartByTableId(tableId);
    }

    // 주문카드 추가
    @PostMapping("/items")
    public AddCartItemResponse addCartItem(@RequestBody AddCartItemRequest request) {
        return cartService.addCartItem(request);
    }
}

