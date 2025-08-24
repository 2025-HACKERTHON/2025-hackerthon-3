package com.example.likelion_ch.controller;

import com.example.likelion_ch.dto.*;
import com.example.likelion_ch.entity.Menu;
import com.example.likelion_ch.entity.RestaurantInfo;
import com.example.likelion_ch.entity.SiteUser;
import com.example.likelion_ch.entity.StoreFeature;
import com.example.likelion_ch.repository.MenuRepository;
import com.example.likelion_ch.service.GeminiTranslationService;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/store")
@RequiredArgsConstructor
@Tag(name = "Menu API", description = "메뉴 관리 API")
public class MenuController {

    private final MenuService menuService;
    private final StoreService storeService;
    @Autowired
    private MenuRepository menuRepository;
    @Autowired
    private GeminiTranslationService translationService;

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

    // 메뉴 등록 (이미지 포함 가능)
    @PostMapping(value = "/{userId}/settings/menu_info", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MenuResponse> createMenu(
            @PathVariable Long userId,
            @ModelAttribute MenuRequest menuRequest,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        // 기본 언어 ko
        if (menuRequest.getLanguage() == null) menuRequest.setLanguage("ko");

        MenuResponse menu = menuService.createMenuWithImage(userId, menuRequest, image);
        return ResponseEntity.ok(menu);
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
        List<MenuResponse> menus = menuService.getAllMenusForStore(userId);

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
            String storeUrl = "http://3.38.135.47:8080/api/store/" + userId;

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
    // 모든 언어 번역 및 저장
    @GetMapping("/{userId}/settings/menu_info/lang")
    @Transactional
    public ResponseEntity<List<MenuResponse>> translateAllMenus(@PathVariable Long userId) {
        // 1. 한국어 메뉴 가져오기
        List<Menu> koMenus = menuRepository.findByUserIdAndLanguage(userId, "ko");

        // 2. 한국어 메뉴가 없으면 빈 리스트 반환
        if (koMenus.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        // 3. 각 메뉴 번역 및 DB 저장
        List<MenuResponse> translatedMenus = koMenus.stream().map(menu -> {
            // 영어 번역
            if (menu.getNameEn() == null) {
                menu.setNameEn(translateText(menu.getNameKo(), "en"));
            }
            if (menu.getDescriptionEn() == null) {
                menu.setDescriptionEn(translateText(menu.getDescription(), "en"));
            }

            // 일본어 번역
            if (menu.getNameJa() == null) {
                menu.setNameJa(translateText(menu.getNameKo(), "ja"));
            }
            if (menu.getDescriptionJa() == null) {
                menu.setDescriptionJa(translateText(menu.getDescription(), "ja"));
            }

            // 중국어 번역
            if (menu.getNameCh() == null) {
                menu.setNameCh(translateText(menu.getNameKo(), "ch"));
            }
            if (menu.getDescriptionCh() == null) {
                menu.setDescriptionCh(translateText(menu.getDescription(), "ch"));
            }

            // DB 저장
            menuRepository.save(menu);

            // Menu -> MenuResponse 변환
            return toMenuResponse(menu);
        }).toList();

        return ResponseEntity.ok(translatedMenus);
    }

    // 언어별 업데이트
//    @PatchMapping("/{userId}/settings/menu_info/{menuId}/lang/{langCode}")
//    public ResponseEntity<MenuResponse> updateMenuLang(
//            @PathVariable Long userId,
//            @PathVariable Long menuId,
//            @PathVariable String langCode,
//            @RequestBody MenuRequest menuRequest) {
//
//        MenuResponse updated = menuService.updateMenuLanguage(userId, menuId.intValue(), langCode.toLowerCase(), menuRequest);
//        return ResponseEntity.ok(updated);
//    }

    // 식당 정보를 요청된 언어로 번역해 RestaurantInfoResponse 생성
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

    // GeminiTranslationService를 사용하는 번역
    private String translateText(String text, String langCode) {
        if (text == null || text.isEmpty()) return text;

        TranslationRequest request = TranslationRequest.builder().text(text).build();
        String targetLang = getTargetLanguageName(langCode);
        return translationService.translate(request, targetLang, null).getTranslatedText();
    }

    // 언어코드를 언어명으로 변경
    private String getTargetLanguageName(String langCode) {
        return switch (langCode.toLowerCase()) {
            case "en" -> "영어";
            case "ch" -> "중국어";
            case "ja" -> "일본어";
            default -> throw new IllegalArgumentException("지원하지 않는 언어 코드입니다: " + langCode);
        };
    }
    @Transactional
    public List<MenuResponse> getMenuByUserIdAndLang(Long userId, String langCode) {
        List<Menu> existingMenus = menuRepository.findByUserIdAndLanguage(userId, langCode);
        if (!existingMenus.isEmpty()) {
            return existingMenus.stream()
                    .map(this::toMenuResponse)
                    .collect(Collectors.toList());
        }

        // 한국어 메뉴 가져오기
        List<Menu> koMenus = menuRepository.findByUserIdAndLanguage(userId, "ko");

        List<Menu> translatedMenus = koMenus.stream().map(menu -> {
            Menu newMenu = new Menu();
            newMenu.setUser(menu.getUser());
            newMenu.setUserMenuId(menu.getUserMenuId());
            newMenu.setPrice(menu.getPrice());
            newMenu.setImageUrl(menu.getImageUrl());
            newMenu.setVersion(menu.getVersion());
            newMenu.setLanguage(langCode);

            // 메뉴명, 설명 번역
            switch (langCode) {
                case "en":
                    newMenu.setNameEn(translateText(menu.getNameKo(), "en"));
                    newMenu.setDescriptionEn(translateText(menu.getDescription(), "en"));
                    break;
                case "ja":
                    newMenu.setNameJa(translateText(menu.getNameKo(), "ja"));
                    newMenu.setDescriptionJa(translateText(menu.getDescription(), "ja"));
                    break;
                case "ch":
                    newMenu.setNameCh(translateText(menu.getNameKo(), "ch"));
                    newMenu.setDescriptionCh(translateText(menu.getDescription(), "ch"));
                    break;
            }

            return menuRepository.save(newMenu);
        }).toList();

        return translatedMenus.stream()
                .map(this::toMenuResponse)
                .collect(Collectors.toList());
    }
    // Menu -> MenuResponse 변환
    private MenuResponse toMenuResponse(Menu menu) {
        return MenuResponse.builder()
                .id(menu.getId())
                .userMenuId(menu.getUserMenuId())
                .nameKo(menu.getNameKo())
                .nameEn(menu.getNameEn())
                .nameJa(menu.getNameJa())
                .nameCh(menu.getNameCh())
                .description(menu.getDescription())
                .descriptionEn(menu.getDescriptionEn())
                .descriptionJa(menu.getDescriptionJa())
                .descriptionCh(menu.getDescriptionCh())
                .price(menu.getPrice())
                .imageUrl(menu.getImageUrl())
                .language(menu.getLanguage())
                .userId(menu.getUser() != null ? menu.getUser().getId() : null)
                .build();
    }

    // 언어별 메뉴 조회
    @GetMapping("/{userId}/settings/menu_info/lang/{langCode}")
    public ResponseEntity<StoreResponse> getStoreWithMenuByLang(
            @PathVariable Long userId,
            @PathVariable String langCode) {
        StoreResponse store = menuService.getStoreWithMenu(userId);
        store.getMenuList().forEach(menu -> menu.setLanguage(langCode));
        return ResponseEntity.ok(store);
    }
    }