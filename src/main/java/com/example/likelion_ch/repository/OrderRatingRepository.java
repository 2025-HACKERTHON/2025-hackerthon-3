package com.example.likelion_ch.repository;

import com.example.likelion_ch.entity.OrderRating;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRatingRepository extends JpaRepository<OrderRating, Long> {

    // 최신 순으로 조회
    List<OrderRating> findAllByOrderByCreatedAtDesc(Pageable pageable);
}