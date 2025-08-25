package com.example.likelion_ch.controller;

import com.example.likelion_ch.dto.LanguageRequest;
import com.example.likelion_ch.entity.CustomerTable;
import com.example.likelion_ch.repository.CustomerTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/tables")
public class TableController {

    private final CustomerTableRepository customerTableRepository;

    @PostMapping("/{tableId}/language")
    public ResponseEntity<String> setTableLanguage(
            @PathVariable Long tableId,
            @RequestBody LanguageRequest request) {

        CustomerTable table = customerTableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found"));

        table.setLanguage(request.getLanguage());
        customerTableRepository.save(table);

        return ResponseEntity.ok("Language updated to " + request.getLanguage());
    }
}
