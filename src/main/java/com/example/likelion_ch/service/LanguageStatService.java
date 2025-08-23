package com.example.likelion_ch.service;

import com.example.likelion_ch.dto.LanguageRatioResponse;
import com.example.likelion_ch.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LanguageStatService {

    private final OrderItemRepository orderItemRepository;

    public List<LanguageRatioResponse> getLanguageRatio(Long userId) {
        List<Object[]> results = orderItemRepository.countLanguageByUser(userId);

        // 총 개수 구하기
        long total = results.stream()
                .mapToLong(r -> (long) r[1])
                .sum();

        List<LanguageRatioResponse> responseList = new ArrayList<>();

        for (Object[] row : results) {
            String language = (String) row[0];
            long count = (long) row[1];
            double percentage = total > 0 ? (count * 100.0 / total) : 0.0;

            responseList.add(new LanguageRatioResponse(language, percentage));
        }

        return responseList;
    }
}