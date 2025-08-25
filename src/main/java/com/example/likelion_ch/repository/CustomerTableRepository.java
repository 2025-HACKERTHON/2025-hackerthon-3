package com.example.likelion_ch.repository;

import com.example.likelion_ch.entity.CustomerTable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerTableRepository extends JpaRepository<CustomerTable, Long> {
}
