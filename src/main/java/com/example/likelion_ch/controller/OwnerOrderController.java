/*package com.example.likelion_ch.controller;

import com.example.likelion_ch.dto.OwnerOrderResponse;
import com.example.likelion_ch.dto.OwnerTopMenuResponse;
import com.example.likelion_ch.service.OwnerOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class OwnerOrderController {

    private final OwnerOrderService ownerOrderService;

    // 1. 전체 주문 내역
    @GetMapping("/owners/{ownerId}/orders")
    public List<OwnerOrderResponse> getAllOrders(@PathVariable Long ownerId) {
        return ownerOrderService.getAllOrders(ownerId);
    }

    // 2. 언어별 주문 비율
    @GetMapping("/owners/{ownerId}/orders/language-count")
    public Map<String, Long> getOrderCountByLanguage(@PathVariable Long ownerId) {
        return ownerOrderService.getOrderCountByLanguage(ownerId);
    }

    // 3. 언어별 Top3 메뉴
    @GetMapping("/owners/{ownerId}/orders/top-menus")
    public Map<String, List<OwnerTopMenuResponse>> getTopMenusByLanguage(@PathVariable Long ownerId) {
        return ownerOrderService.getTopMenusByLanguage(ownerId);
    }
}
*/