package com.example.likelion_ch.repository;

import com.example.likelion_ch.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByTableId(Long tableId);
}
