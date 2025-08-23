package com.example.likelion_ch.service;

import com.example.likelion_ch.entity.Menu;
import com.example.likelion_ch.repository.MenuRepository;
import com.example.likelion_ch.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuStatService {

    private final OrderItemRepository orderItemRepository;
    private final MenuRepository menuRepository;

    // userId + language 기준 상위 3개 메뉴 조회
    public List<String> getTop3MenusByUserAndLanguage(Long userId, String language) {
        List<Long> topMenuIds = orderItemRepository
                .findTopMenuIdsByUserAndLanguage(userId, language)
                .stream()
                .limit(3)
                .collect(Collectors.toList());

        List<Menu> menus = menuRepository.findByIdIn(topMenuIds);

        Map<Long, String> idNameMap = menus.stream()
                .collect(Collectors.toMap(Menu::getId, Menu::getMenuName));

        return topMenuIds.stream()
                .map(idNameMap::get)
                .collect(Collectors.toList());
    }
}
