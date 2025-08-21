package com.example.likelion_ch.controller;

import com.example.likelion_ch.dto.*;
import com.example.likelion_ch.entity.RestaurantInfo;
import com.example.likelion_ch.entity.SiteUser;
import com.example.likelion_ch.service.MenuService;
import com.example.likelion_ch.service.StoreService;
import com.example.likelion_ch.util.QRCodeGenerator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.catalina.Store;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.example.likelion_ch.dto.MenuWithRestaurantResponse;
import com.example.likelion_ch.service.GeminiTranslationService;

@Slf4j
@RestController
@RequestMapping("/api/store")
@RequiredArgsConstructor
@Tag(name = "Menu API", description = "메뉴 관리 API")
public class MenuController {

    private final MenuService menuService;
    private final StoreService storeService;
    private final GeminiTranslationService translationService;

    // 언어별 메뉴 조회 (이미 번역됨)
    @GetMapping("/{userId}/settings/menu_info/{langCode}")
    public ResponseEntity<List<MenuInfo>> getTranslatedMenuInfo(
            @PathVariable Long userId,
            @PathVariable String langCode) {

        log.info("번역 메뉴 조회 요청: 사용자={}, 언어={}", userId, langCode);

        try {
            // 기존 메뉴만 조회
            List<MenuInfo> menuInfoList = menuService.getExistingMenusByLanguage(userId, langCode);

            log.info("기존 메뉴 조회 완료: 사용자={}, 언어={}, 메뉴 수={}", userId, langCode, menuInfoList.size());

            return ResponseEntity.ok(menuInfoList);

        } catch (IllegalArgumentException e) {
            log.warn("잘못된 요청: {}", e.getMessage());
            return ResponseEntity.badRequest().build();

        } catch (Exception e) {
            log.error("메뉴 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 가게 정보 + 메뉴 리스트
    @GetMapping("/{userId}")
    @Operation(summary = "가게 정보와 메뉴 조회", description = "가게 정보와 함께 메뉴 목록을 조회합니다.")
    public ResponseEntity<StoreResponse> getStoreWithMenu(@PathVariable Long userId) {
        return ResponseEntity.ok(menuService.getStoreWithMenu(userId));
    }

    // 전체 메뉴 조회
    @GetMapping("/{userId}/settings/menu_info")
    @Operation(summary = "전체 메뉴 조회", description = "사용자의 모든 메뉴를 조회합니다.")
    public ResponseEntity<List<MenuResponse>> getAllMenus(@PathVariable Long userId) {
        List<MenuResponse> menus = menuService.getMenusByUser(userId);
        return ResponseEntity.ok(menus);
    }

    // 메뉴 등록
    @PostMapping("/{userId}/settings/menu_info")
    @Operation(summary = "메뉴 등록", description = "새로운 메뉴를 등록합니다. (이미지 포함 가능)")
    public ResponseEntity<MenuResponse> createMenu(
            @PathVariable Long userId,
            @RequestParam("nameKo") String nameKo,
            @RequestParam("description") String description,
            @RequestParam("price") BigDecimal price,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        try {
            MenuRequest request = MenuRequest.builder()
                    .menuName(nameKo)
                    .menuDescription(description)
                    .menuPrice(price)
                    .build();

            MenuResponse menu = menuService.createMenuWithImage(userId, request, image);
            return ResponseEntity.ok(menu);

        } catch (RuntimeException e) {
            log.warn("메뉴 등록 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("메뉴 등록 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }


    // 베스트 메뉴 TOP3
    @GetMapping("/{userId}/top3")
    public ResponseEntity<TopMenuResponse> getBestMenus(@PathVariable Long userId) {
        return ResponseEntity.ok(menuService.getTopMenu(userId));
    }

    // 언어 기반 추천 메뉴 TOP3
    @GetMapping("/{userId}/recommend")
    public ResponseEntity<TopMenuResponse> getRecommendedMenus(
            @PathVariable Long userId,
            @RequestParam String lang) {
        return ResponseEntity.ok(menuService.getTopMenuByLanguage(userId, lang));
    }

    // 전체 메뉴 + 가게 정보 조회
    @GetMapping("/{userId}/all")
    public ResponseEntity<MenuWithRestaurantInfoDTO> getAllMenusWithStore(@PathVariable Long userId) {
        // 메뉴 정보 조회
        List<MenuInfo> menus = menuService.getAllMenusForStore(userId);

        // 가게 정보 조회
        RestaurantInfo restaurant = storeService.getRestaurantInfoByUserId(userId);

        // features 조회
        List<String> features = storeService.getFeaturesByUserId(userId);

        // DTO 생성
        MenuWithRestaurantInfoDTO response = new MenuWithRestaurantInfoDTO(
                restaurant.getRestaurantName(),
                restaurant.getRestaurantAddress(),
                restaurant.getShortDescription(),
                restaurant.getLongDescription(),
                menus,
                features
        );

        return ResponseEntity.ok(response);
    }


    // QRCode
    @GetMapping("/{userId}/qrCode")
    @Operation(summary = "가게 QR코드 생성", description = "가게 정보가 포함된 QR코드를 생성합니다.")
    public ResponseEntity<byte[]> getStoreQRCode(@PathVariable Long userId) {
        try {
            // QR코드에 넣을 URL (예: 해당 가게 상세 페이지)
            String storeUrl = "https://example.com/store/" + userId;

            BufferedImage qrImage = QRCodeGenerator.generateQRCodeImage(storeUrl, 250, 250);

            // BufferedImage -> byte[]
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(qrImage, "PNG", baos);
            byte[] imageBytes = baos.toByteArray();

            return ResponseEntity
                    .ok()
                    .header("Content-Type", "image/png")
                    .body(imageBytes);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // 단일 메뉴 조회
    @GetMapping("/{userId}/settings/menu_info/id/{userMenuId}")
    @Operation(summary = "단일 메뉴 조회", description = "사용자의 특정 메뉴 정보를 조회합니다.")
    public ResponseEntity<MenuResponse> getMenuById(
            @PathVariable Long userId,
            @PathVariable Integer userMenuId) {
        try {
            MenuResponse menu = menuService.getMenuById(userId, userMenuId);
            return ResponseEntity.ok(menu);
        } catch (RuntimeException e) {
            log.warn("메뉴 조회 실패: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("메뉴 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

     // 메뉴 수정 (이미지 포함)
     @PutMapping("/{userId}/settings/menu_info/id/{userMenuId}")
     @Operation(summary = "메뉴 수정", description = "메뉴 정보와 이미지를 수정합니다.")
     public ResponseEntity<MenuResponse> updateMenu(
             @PathVariable Long userId,
             @PathVariable Integer userMenuId,
             @RequestParam("nameKo") String nameKo,
             @RequestParam("description") String description,
             @RequestParam("price") BigDecimal price,
             @RequestParam(value = "image", required = false) MultipartFile image) {
         try {
             MenuRequest request = MenuRequest.builder()
                     .menuName(nameKo)
                     .menuDescription(description)
                     .menuPrice(price)
                     .build();

             MenuResponse updatedMenu = menuService.updateMenuWithImage(userId, userMenuId, request, image);
             return ResponseEntity.ok(updatedMenu);
         } catch (IllegalArgumentException e) {
             log.warn("잘못된 요청: {}", e.getMessage());
             return ResponseEntity.badRequest().build();
         } catch (RuntimeException e) {
             log.warn("메뉴 수정 실패: {}", e.getMessage());
             return ResponseEntity.notFound().build();
         } catch (Exception e) {
             log.error("메뉴 수정 중 오류 발생: {}", e.getMessage(), e);
             return ResponseEntity.internalServerError().build();
         }
     }

     // 메뉴 삭제 (이미지 포함)
     @DeleteMapping("/{userId}/settings/menu_info/id/{userMenuId}")
     @Operation(summary = "메뉴 삭제", description = "메뉴와 관련 이미지를 삭제합니다.")
     public ResponseEntity<Void> deleteMenu(
             @PathVariable Long userId,
             @PathVariable Integer userMenuId) {
         try {
             menuService.deleteMenuWithImage(userId, userMenuId);
             return ResponseEntity.noContent().build();
         } catch (RuntimeException e) {
             log.warn("메뉴 삭제 실패: {}", e.getMessage());
             return ResponseEntity.notFound().build();
         } catch (Exception e) {
             log.error("메뉴 삭제 중 오류 발생: {}", e.getMessage(), e);
             return ResponseEntity.internalServerError().build();
         }
     }

     // 언어별 메뉴 + 식당 정보 조회
     @GetMapping("/{userId}/settings/menu_info/lang/{langCode}")
     @Operation(summary = "언어별 메뉴 조회", description = "지정된 언어로 번역된 메뉴와 식당 정보를 조회합니다.")
     public ResponseEntity<MenuWithRestaurantResponse> getMenuByLanguage(
             @PathVariable Long userId,
             @PathVariable String langCode) {

         try {
             // 1. 식당 정보 조회
             RestaurantInfo restaurantInfo = storeService.getRestaurantInfoByUserId(userId);

             // 2. 메뉴 정보 조회 (언어별)
             List<MenuInfo> menuList = menuService.getMenuInfoByLanguage(userId, langCode);

             // 3. RestaurantInfo를 RestaurantInfoResponse로 변환 (언어별 번역 포함)
             RestaurantInfoResponse restaurantInfoResponse = createTranslatedRestaurantInfo(restaurantInfo, langCode);

             // 4. DTO로 묶어서 반환
             MenuWithRestaurantResponse response = new MenuWithRestaurantResponse(restaurantInfoResponse, menuList);

             return ResponseEntity.ok(response);

         } catch (IllegalArgumentException e) {
             log.warn("잘못된 언어 코드: {}", e.getMessage());
             return ResponseEntity.badRequest().build();

         } catch (Exception e) {
             log.error("언어별 메뉴 조회 중 오류 발생: {}", e.getMessage(), e);
             return ResponseEntity.internalServerError().build();
         }
     }

     /**
      * 식당 정보를 요청된 언어로 번역하여 RestaurantInfoResponse 생성
      */
    private RestaurantInfoResponse createTranslatedRestaurantInfo(RestaurantInfo restaurantInfo, String langCode) {
        String restaurantName = restaurantInfo.getRestaurantName();
        String restaurantAddress = restaurantInfo.getRestaurantAddress();
        String shortDescription = restaurantInfo.getShortDescription();
        String longDescription = restaurantInfo.getLongDescription();
        Integer tableCount = restaurantInfo.getTableCount();
        List<String> features = restaurantInfo.getFeatures();

        // 한국어가 아닌 경우 번역 시도
        if (!"ko".equals(langCode)) {
            try {
                if (restaurantName != null && !restaurantName.isEmpty()) {
                    restaurantName = translateText(restaurantName, langCode);
                }
                if (shortDescription != null && !shortDescription.isEmpty()) {
                    shortDescription = translateText(shortDescription, langCode);
                }
                if (longDescription != null && !longDescription.isEmpty()) {
                    longDescription = translateText(longDescription, langCode);
                }
                // features도 번역
                if (features != null && !features.isEmpty()) {
                    features = features.stream()
                            .map(feature -> translateText(feature, langCode))
                            .toList();
                }
            } catch (Exception e) {
                log.warn("식당 정보 번역 실패: {}", e.getMessage());
                // 번역 실패 시 원본 텍스트 사용
            }
        }

        return RestaurantInfoResponse.builder()
                .restaurantName(restaurantName)
                .restaurantAddress(restaurantAddress)
                .shortDescription(shortDescription)
                .longDescription(longDescription)
                .tableCount(tableCount)
                .features(features)
                .build();
    }

    /**
     * 텍스트를 지정된 언어로 번역
     */
    private String translateText(String text, String targetLangCode) {
        try {
            TranslationRequest request = TranslationRequest.builder()
                    .text(text)
                    .build();

            String targetLanguage = getTargetLanguageName(targetLangCode);
            TranslationResponse response = translationService.translate(request, targetLanguage, null);
            return response.getTranslatedText();
        } catch (Exception e) {
            log.warn("텍스트 번역 실패: {} -> {}", text, e.getMessage());
            return text; // 번역 실패 시 원본 텍스트 반환
        }
    }

    /**
     * 언어 코드를 언어명으로 변환
     */
    private String getTargetLanguageName(String langCode) {
        return switch (langCode.toLowerCase()) {
            case "en" -> "영어";
            case "ch" -> "중국어";
            case "ja" -> "일본어";
            default -> throw new IllegalArgumentException("지원하지 않는 언어 코드입니다: " + langCode);
        };
    }
}
