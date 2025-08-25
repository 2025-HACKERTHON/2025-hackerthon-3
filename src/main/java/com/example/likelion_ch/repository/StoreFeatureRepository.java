package com.example.likelion_ch.repository;

import com.example.likelion_ch.entity.StoreFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StoreFeatureRepository extends JpaRepository<StoreFeature, Long> {
    Optional<StoreFeature> findByName(String name);

    @Query("SELECT f.name FROM StoreFeature f JOIN f.users u WHERE u.id = :userId")
    List<String> findFeaturesByUserId(@Param("userId") Long userId);
}