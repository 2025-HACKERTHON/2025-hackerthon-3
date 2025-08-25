package com.example.likelion_ch.repository;

import com.example.likelion_ch.entity.Order;
import com.example.likelion_ch.entity.SiteUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o JOIN FETCH o.orderItems WHERE o.id = :id")
    Order findByIdWithItems(@Param("id") Long id);

    List<Order> findByUser(SiteUser user);
}
