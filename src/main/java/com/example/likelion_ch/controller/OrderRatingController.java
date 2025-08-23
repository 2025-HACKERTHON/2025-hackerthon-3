package com.example.likelion_ch.controller;

import com.example.likelion_ch.dto.OrderRatingResponse;
import com.example.likelion_ch.dto.RatingRequest;
import com.example.likelion_ch.service.OrderRatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-ratings")
@RequiredArgsConstructor
public class OrderRatingController {

    private final OrderRatingService ratingService;

    // 별점 저장
    @PostMapping
    public OrderRatingResponse createRating(@RequestBody RatingRequest request) {
        return ratingService.saveRating(request.getOrderId(), request.getStar());
    }

    // 최근 N개의 별점 조회
    @GetMapping("/recent")
    public List<OrderRatingResponse> getRecentRatings(@RequestParam int limit) {
        return ratingService.getRecentRatings(limit);
    }
}
