/*package com.example.likelion_ch.repository;

import com.example.likelion_ch.dto.OwnerOrderResponse;
import com.example.likelion_ch.dto.OwnerTopMenuResponse;
import com.example.likelion_ch.entity.OrderItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OwnerOrderItemRepository extends JpaRepository<OrderItem, Long> {

    // 1. 사장님 기준 전체 주문 내역
    @Query("SELECT new com.example.likelion_ch.dto.OwnerOrderResponse(" +
            "oi.order.id, m.name, oi.quantity, oi.cardQuantity, oi.cardNames) " +
            "FROM OrderItem oi JOIN oi.menu m " +
            "WHERE m.user.id = :ownerId " +
            "ORDER BY oi.createdAt DESC")
    List<OwnerOrderResponse> findOrdersByOwnerId(@Param("ownerId") Long ownerId);

    // 2. 사장님 가게 주문 국적/언어별 주문 수
    @Query("SELECT oi.language, COUNT(oi) " +
            "FROM OrderItem oi JOIN oi.menu m " +
            "WHERE m.user.id = :ownerId " +
            "GROUP BY oi.language")
    List<Object[]> findOrderCountByLanguage(@Param("ownerId") Long ownerId);

    // 3. 언어별 Top3 메뉴
    @Query("SELECT new com.example.likelion_ch.dto.OwnerTopMenuResponse(m.name, SUM(oi.quantity)) " +
            "FROM OrderItem oi JOIN oi.menu m " +
            "WHERE m.user.id = :ownerId AND oi.language = :lang " +
            "GROUP BY m.name " +
            "ORDER BY SUM(oi.quantity) DESC")
    List<OwnerTopMenuResponse> findTopMenuByLanguage(@Param("ownerId") Long ownerId,
                                                     @Param("lang") String lang,
                                                     Pageable pageable);
}*/
