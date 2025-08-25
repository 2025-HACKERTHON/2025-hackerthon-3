package com.example.likelion_ch.service;

import com.example.likelion_ch.dto.*;
import com.example.likelion_ch.entity.CartItem;
import com.example.likelion_ch.entity.CartItemOption;
import com.example.likelion_ch.repository.CartItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;

    // -------------------------------
    // 장바구니 조회
    // -------------------------------
    @Transactional(readOnly = true)
    public CartResponse getCartByTableId(Long tableId) {
        List<CartItem> cartItems = cartItemRepository.findByTableId(tableId);

        List<CartItemResponse> itemResponses = cartItems.stream().map(item -> {
            List<CartItemResponse.OptionResponse> options = item.getOptions().stream()
                    .map(opt -> CartItemResponse.OptionResponse.builder()
                            .optionName(opt.getOptionName())
                            .optionValue(opt.getOptionValue())
                            .build())
                    .collect(Collectors.toList());

            int unitPrice = 5000; // 실제 서비스에서는 메뉴 DB에서 조회
            return CartItemResponse.builder()
                    .menuId(item.getMenuId())
                    .menuName("임시 메뉴명")
                    .menuDescription("임시 한줄소개")
                    .unitPrice(unitPrice)
                    .orderCardCount(item.getQuantity())
                    .totalPrice(unitPrice * item.getQuantity())
                    .options(options)
                    .build();
        }).collect(Collectors.toList());

        int totalOrderCards = cartItems.stream()
                .mapToInt(CartItem::getQuantity)
                .sum();

        return CartResponse.builder()
                .cartItems(itemResponses)
                .totalOrderCards(totalOrderCards)
                .build();
    }

    // -------------------------------
    // 주문카드 추가
    // -------------------------------
    @Transactional
    public AddCartItemResponse addCartItem(AddCartItemRequest request) {

        // 1. CartItem 생성
        CartItem cartItem = CartItem.builder()
                .tableId(request.getTableId())
                .menuId(request.getMenuId())
                .quantity(1)
                .build();

        // 2. 옵션 생성
        List<CartItemOption> options = request.getOptions().entrySet().stream()
                .map(entry -> CartItemOption.builder()
                        .optionName(entry.getKey())
                        .optionValue(entry.getValue())
                        .cartItem(cartItem)
                        .build())
                .collect(Collectors.toList());

        cartItem.setOptions(options);

        // 3. 저장
        cartItemRepository.save(cartItem);

        // 4. 장바구니 조회 한 번만
        List<CartItem> items = cartItemRepository.findByTableId(request.getTableId());

        int menuOrderCardCount = items.stream()
                .filter(item -> item.getMenuId().equals(request.getMenuId()))
                .mapToInt(CartItem::getQuantity)
                .sum();

        int totalOrderCards = items.stream()
                .mapToInt(CartItem::getQuantity)
                .sum();

        return AddCartItemResponse.builder()
                .menuId(request.getMenuId())
                .orderCardCount(menuOrderCardCount)
                .totalOrderCards(totalOrderCards)
                .build();
    }
}
