package com.example.likelion_ch.service;

import com.example.likelion_ch.dto.OrderRatingResponse;
import com.example.likelion_ch.entity.Order;
import com.example.likelion_ch.entity.OrderRating;
import com.example.likelion_ch.repository.OrderRatingRepository;
import com.example.likelion_ch.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderRatingService {

    private final OrderRatingRepository ratingRepository;
    private final OrderRepository orderRepository;

    /**
     * 손님이 별점 저장
     */
    @Transactional
    public OrderRatingResponse saveRating(Long orderId, int star) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        OrderRating rating = OrderRating.builder()
                .star(star)
                .order(order)
                .createdAt(LocalDateTime.now())
                .build();

        ratingRepository.save(rating);

        return new OrderRatingResponse(
                rating.getId(),
                rating.getStar(),
                rating.getCreatedAt(),
                order.getId()
        );
    }

    /**
     * 사장님: 최근 N개의 별점 조회
     */
    @Transactional(readOnly = true)
    public List<OrderRatingResponse> getRecentRatings(int limit) {
        List<OrderRating> ratings = ratingRepository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(0, limit, Sort.by("createdAt").descending())
        );

        return ratings.stream()
                .map(r -> new OrderRatingResponse(
                        r.getId(),
                        r.getStar(),
                        r.getCreatedAt(),
                        r.getOrder() != null ? r.getOrder().getId() : null
                ))
                .collect(Collectors.toList());
    }
}
