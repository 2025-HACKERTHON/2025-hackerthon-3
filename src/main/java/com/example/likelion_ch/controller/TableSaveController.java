package com.example.likelion_ch.controller;

import com.example.likelion_ch.dto.TableRequest;
import com.example.likelion_ch.dto.TableResponse;
import com.example.likelion_ch.service.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/table-save")
@RequiredArgsConstructor
public class TableSaveController {

    private final TableService tableService;

    // 테이블 선택/저장
    @PostMapping
    public TableResponse saveTable(@RequestBody TableRequest request) {
        return tableService.saveTable(request.getUserId(), request.getTableId());
    }
}
