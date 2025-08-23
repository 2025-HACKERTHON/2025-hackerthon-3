package com.example.likelion_ch.repository;

import com.example.likelion_ch.entity.Menu;
import com.example.likelion_ch.entity.SiteUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface MenuRepository extends JpaRepository<Menu, Long> {

    List<Menu> findByUser(SiteUser user);
    List<Menu> findByIdIn(List<Long> ids);
    Optional<Menu> findByIdAndUserId(Long menuId, Long userId);

    @Query("SELECT m FROM Menu m WHERE m.user.id = :userId " +
            "AND (:query IS NULL OR m.nameKo LIKE %:query% OR m.description LIKE %:query%) " +
            "AND (:minPrice IS NULL OR m.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR m.price <= :maxPrice)")
    Page<Menu> findByUserIdAndSearchCriteria(
            @Param("userId") Long userId,
            @Param("query") String query,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable);

    Optional<Menu> findByUserAndUserMenuId(SiteUser user, Integer userMenuId);

    Optional<Menu> findByUserMenuIdAndUser_Id(Integer userMenuId, Long userId);

    @Query("SELECT COALESCE(MAX(m.userMenuId), 0) FROM Menu m WHERE m.user = :user")
    Integer findMaxUserMenuId(@Param("user") SiteUser user);

    // 특정 사용자의 특정 언어 메뉴 조회
    @Query("SELECT m FROM Menu m WHERE m.user.id = :userId AND m.language = :language")
    List<Menu> findByUserIdAndLanguage(@Param("userId") Long userId, @Param("language") String language);

    // 특정 사용자의 모든 메뉴 조회 (언어별로 그룹화)
    @Query("SELECT m FROM Menu m WHERE m.user.id = :userId ORDER BY m.userMenuId, m.language")
    List<Menu> findByUserIdOrderByUserMenuIdAndLanguage(@Param("userId") Long userId);
}
