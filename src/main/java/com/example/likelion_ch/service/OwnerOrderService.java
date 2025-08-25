/*package com.example.likelion_ch.service;

import com.example.likelion_ch.dto.OwnerOrderResponse;
import com.example.likelion_ch.dto.OwnerTopMenuResponse;
import com.example.likelion_ch.repository.OwnerOrderItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OwnerOrderService {

    private final OwnerOrderItemRepository orderItemRepository;

    // 전체 주문 내역
    public List<OwnerOrderResponse> getAllOrders(Long ownerId) {
        return orderItemRepository.findOrdersByOwnerId(ownerId);
    }

    // 언어별 주문 비율
    public Map<String, Long> getOrderCountByLanguage(Long ownerId) {
        List<Object[]> results = orderItemRepository.findOrderCountByLanguage(ownerId);
        Map<String, Long> map = new HashMap<>();
        for (Object[] row : results) {
            String language = (String) row[0];
            Long count = (Long) row[1];
            map.put(language, count);
        }
        return map;
    }

    // 언어별 Top3 메뉴
    public Map<String, List<OwnerTopMenuResponse>> getTopMenusByLanguage(Long ownerId) {
        String[] langs = {"JAPANESE", "CHINESE", "ENGLISH"}; // 필요하면 다른 언어 추가
        Map<String, List<OwnerTopMenuResponse>> topMenus = new HashMap<>();
        for (String lang : langs) {
            List<OwnerTopMenuResponse> top3 = orderItemRepository.findTopMenuByLanguage(ownerId, lang, PageRequest.of(0,3));
            topMenus.put(lang, top3);
        }
        return topMenus;
    }
}*/


