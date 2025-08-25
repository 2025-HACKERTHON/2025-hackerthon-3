package com.example.likelion_ch.repository;

import com.example.likelion_ch.dto.MenuInfo;
import com.example.likelion_ch.entity.OrderItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // 사용자별 top 메뉴
    @Query("SELECT new com.example.likelion_ch.dto.MenuInfo(m.nameKo, m.description, m.price) " +
            "FROM OrderItem oi " +
            "JOIN oi.menu m " +
            "WHERE oi.menu.user.id = :userId " +
            "GROUP BY m.id, m.nameKo, m.description, m.price " +
            "ORDER BY COUNT(oi.id) DESC")
    List<MenuInfo> findTopMenu(@Param("userId") Long userId, Pageable pageable);

    // 사용자별, 언어별 top 메뉴
    @Query("SELECT new com.example.likelion_ch.dto.MenuInfo(m.nameKo, m.description, m.price) " +
            "FROM OrderItem oi " +
            "JOIN oi.menu m " +
            "WHERE oi.menu.user.id = :userId AND m.language = :lang " +
            "GROUP BY m.id, m.nameKo, m.description, m.price " +
            "ORDER BY COUNT(oi.id) DESC")
    List<MenuInfo> findTopMenuByLanguage(@Param("userId") Long userId,
                                         @Param("lang") String lang,
                                         Pageable pageable);

    //국적 비율
    @Query("SELECT oi.language, COUNT(oi) " +
            "FROM OrderItem oi " +
            "WHERE oi.user.id = :userId " +
            "GROUP BY oi.language")
    List<Object[]> countLanguageByUser(Long userId);

    // storeId(가게) + language 기준 top 메뉴 ID 조회
    @Query("SELECT oi.menu.id FROM OrderItem oi " +
            "WHERE oi.menu.user.id = :userId AND oi.language = :language " +
            "GROUP BY oi.menu.id " +
            "ORDER BY SUM(oi.quantity) DESC")
    List<Long> findTopMenuIdsByUserAndLanguage(@Param("userId") Long userId,
                                                @Param("language") String language);
}

