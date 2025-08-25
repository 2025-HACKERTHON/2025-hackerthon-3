package com.example.likelion_ch.service;

import com.example.likelion_ch.dto.OrderResponse;
import com.example.likelion_ch.dto.OrderRequest;
import com.example.likelion_ch.entity.*;
import com.example.likelion_ch.repository.MenuRepository;
import com.example.likelion_ch.repository.OrderRepository;
import com.example.likelion_ch.repository.SiteUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.likelion_ch.dto.TableOrderDto;

import java.util.Collections;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final MenuRepository menuRepository;
    private final SiteUserRepository userRepository;

    @Transactional
    public Order createOrder(OrderRequest request, Long userId) {
        SiteUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = Order.builder()
                .tableId(request.getTableId())
                .createdAt(LocalDateTime.now())
                .user(user)
                .build();

        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Menu menu = menuRepository.findById(itemReq.getMenuId())
                    .orElseThrow(() -> new RuntimeException("Menu not found"));

            OrderItem orderItem = OrderItem.builder()
                    .menu(menu)
                    .quantity(itemReq.getQuantity())
                    .language(itemReq.getLanguage())
                    .cardQuantity(itemReq.getCardQuantity())
                    .cardNames(itemReq.getCardNames())
                    .user(user)
                    .build();

            // 옵션 추가
            if (itemReq.getOptions() != null) {
                for (String optionName : itemReq.getOptions()) {
                    OrderItemOption option = OrderItemOption.builder()
                            .optionName(optionName)
                            .build();
                    orderItem.addOption(option);
                }
            }

            order.addOrderItem(orderItem);
        }

        return orderRepository.save(order);
    }

    // Order -> OrderResponse 변환 메서드
    public OrderResponse toOrderResponse(Order order) {
        List<OrderResponse.OrderItemResponse> items = order.getOrderItems().stream()
                .map(oi -> new OrderResponse.OrderItemResponse(
                        oi.getId(),
                        oi.getMenu().getMenuName(),
                        oi.getQuantity(),
                        null
                ))
                .toList();

        return new OrderResponse(
                order.getId(),
                Math.toIntExact(order.getTableId()),
                order.getCreatedAt(),
                items
        );
    }

    // 사장님용 현재 주문 조회
    @Transactional(readOnly = true)
    public List<TableOrderDto> getCurrentOrders(Long ownerId) {
        SiteUser owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        // 해당 사장님의 주문만 가져오기
        List<Order> orders = orderRepository.findByUser(owner);

        // 테이블별로 DTO로 변환
        return orders.stream()
                .map(order -> {
                    List<TableOrderDto.OrderItemDto> itemDtos = order.getOrderItems().stream()
                            .map(oi -> new TableOrderDto.OrderItemDto(
                                    oi.getMenu().getMenuName(),
                                    oi.getQuantity(),
                                    oi.getCardQuantity(),
                                    Collections.singletonList(oi.getCardNames())
                            ))
                            .toList();

                    return new TableOrderDto(
                            order.getTableId(),
                            itemDtos
                    );
                })
                .collect(Collectors.toList());
    }
}
