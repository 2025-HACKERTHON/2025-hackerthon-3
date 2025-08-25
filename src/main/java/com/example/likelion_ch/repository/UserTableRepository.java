package com.example.likelion_ch.repository;

import com.example.likelion_ch.entity.UserTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserTableRepository extends JpaRepository<UserTable, Long> {

    Optional<UserTable> findTopByUserIdOrderBySelectedAtDesc(Long userId);
}

