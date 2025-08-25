package com.example.likelion_ch.service;

import com.example.likelion_ch.dto.TableResponse;
import com.example.likelion_ch.entity.UserTable;
import com.example.likelion_ch.repository.UserTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TableService {

    private final UserTableRepository tableRepository;

    @Transactional
    public TableResponse saveTable(Long userId, Long tableId) {
        UserTable userTable = UserTable.builder()
                .userId(userId)
                .tableId(tableId)
                .selectedAt(LocalDateTime.now())
                .build();

        tableRepository.save(userTable);

        return new TableResponse(userId, tableId, userTable.getSelectedAt());
    }

    public Long getLatestTableIdByUser(Long userId) {
        return tableRepository.findTopByUserIdOrderBySelectedAtDesc(userId)
                .map(UserTable::getTableId)
                .orElse(null);
    }
}
