package com.example.likelion_ch.controller;

import com.example.likelion_ch.dto.OrderRequest;
import com.example.likelion_ch.dto.OrderResponse;
import com.example.likelion_ch.dto.TableOrderDto;
import com.example.likelion_ch.entity.Order;
import com.example.likelion_ch.entity.SiteUser;
import com.example.likelion_ch.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // 주문 생성
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @RequestBody OrderRequest request,
            @RequestParam Long userId // 사장님 or 사용자 ID
    ) {
        Order order = orderService.createOrder(request, userId);
        OrderResponse response = orderService.toOrderResponse(order);
        return ResponseEntity.ok(response);
    }

    // 사장님용 현재 주문 조회
    @GetMapping("/current")
    public ResponseEntity<List<TableOrderDto>> getCurrentOrders(Authentication authentication) {
        // 로그인한 사장님 정보 가져오기
        SiteUser user = (SiteUser) authentication.getPrincipal();
        Long ownerId = user.getId();

        // 사장님 ID 기준으로 현재 주문 조회
        List<TableOrderDto> orders = orderService.getCurrentOrders(ownerId);
        return ResponseEntity.ok(orders);
    }

}
