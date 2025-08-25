package com.example.likelion_ch.controller;

import com.example.likelion_ch.dto.StoreUpdateRequest;
import com.example.likelion_ch.entity.SiteUser;
import com.example.likelion_ch.repository.SiteUserRepository;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/store/{userId}/settings")
@RequiredArgsConstructor
public class StoreSettingsController {

    private final SiteUserRepository siteUserRepository;

    @PatchMapping("/store_info")
    @Operation(summary = "가게 정보 수정", description = "가게 정보를 수정합니다.")
    public ResponseEntity<?> updateStoreInfo(@PathVariable Long userId, @RequestBody StoreUpdateRequest request) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        user.setRestaurantName(request.getRestaurantName());
        user.setRestaurantAddress(request.getRestaurantAddress());
        user.setShortDescription(request.getShortDescription());
        user.setLongDescription(request.getLongDescription());

        siteUserRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "식당 정보가 수정되었습니다.");
        return ResponseEntity.ok(response);
    }
}
