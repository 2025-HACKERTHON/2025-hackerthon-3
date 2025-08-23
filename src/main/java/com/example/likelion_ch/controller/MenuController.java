package com.example.likelion_ch.service;

import com.example.likelion_ch.dto.MenuInfo;
import com.example.likelion_ch.dto.MenuRequest;
import com.example.likelion_ch.dto.MenuResponse;
import com.example.likelion_ch.dto.TopMenuResponse;
import com.example.likelion_ch.dto.StoreResponse;
import com.example.likelion_ch.dto.CreateOrderRequest;
import com.example.likelion_ch.dto.TranslationRequest;
import com.example.likelion_ch.dto.MenuWithRestaurantResponse;
import com.example.likelion_ch.dto.RestaurantInfoResponse;
import com.example.likelion_ch.entity.Menu;
import com.example.likelion_ch.entity.OrderItem;
import com.example.likelion_ch.entity.SiteUser;
import com.example.likelion_ch.repository.MenuRepository;
import com.example.likelion_ch.repository.OrderItemRepository;
import com.example.likelion_ch.repository.SiteUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuRepository menuRepository;
    private final SiteUserRepository siteUserRepository;
    private final OrderItemRepository orderItemRepository;
    private final GeminiTranslationService translationService;
    private final S3Service s3Service;

    // 주문 생성
    public void createOrder(CreateOrderRequest request) {
        Menu menu = menuRepository.findById(request.getMenuId())
                .orElseThrow(() -> new RuntimeException("메뉴를 찾을 수 없습니다."));

        OrderItem orderItem = new OrderItem();
        orderItem.setMenu(menu);
        orderItem.setQuantity(request.getQuantity());
        orderItem.setPrice(menu.getPrice().multiply(BigDecimal.valueOf(request.getQuantity())));

        orderItemRepository.save(orderItem);
    }

    // 가게 정보 + 메뉴 리스트
    public StoreResponse getStoreWithMenu(Long userId) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        List<Menu> menuList = menuRepository.findByUser(user);

        return new StoreResponse(
                user.getRestaurantName(),
                user.getRestaurantAddress(),
                user.getShortDescription(),
                user.getLongDescription(),
                menuList
        );
    }

    // top 메뉴 조회
    public TopMenuResponse getTopMenu(Long userId) {
        List<MenuInfo> top3 = orderItemRepository.findTopMenu(userId, Pageable.ofSize(3));
        return new TopMenuResponse(top3);
    }

    // 언어 기반 top 메뉴 조회
    public TopMenuResponse getTopMenuByLanguage(Long userId, String lang) {
        List<MenuInfo> top3ByLang = orderItemRepository.findTopMenuByLanguage(userId, lang, Pageable.ofSize(3));
        return new TopMenuResponse(top3ByLang);
    }

    // 전체 메뉴 조회
    public List<MenuInfo> getAllMenusForStore(Long userId) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        List<Menu> menuList = menuRepository.findByUser(user);

        return menuList.stream()
                .map(menu -> MenuInfo.builder()
                        .nameKo(menu.getMenuName())
                        .description(menu.getDescription())
                        .price(menu.getPrice())
                        .build())
                .toList();
    }

    // 전체 메뉴 조회 (MenuResponse)
    public List<MenuResponse> getMenusByUser(Long userId) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        return menuRepository.findByUser(user).stream()
                .map(menu -> MenuResponse.builder()
                        .id(menu.getId())
                        .nameKo(menu.getNameKo())
                        .description(menu.getDescription())
                        .price(menu.getPrice())
                        .imageUrl(menu.getImageUrl())
                        .userId(user.getId())
                        .createdAt(menu.getCreatedAt())
                        .updatedAt(menu.getUpdatedAt())
                        .build())
                .toList();
    }

    // 단일 메뉴 조회
    public MenuResponse getMenuById(Long userId, Integer userMenuId) {
        Menu menu = menuRepository.findByUserMenuIdAndUser_Id(userMenuId, userId)
                .orElseThrow(() -> new RuntimeException("사용자 소유의 메뉴가 아닙니다."));

        return MenuResponse.builder()
                .id(menu.getId())
                .userMenuId(menu.getUserMenuId())
                .nameKo(menu.getMenuName())
                .description(menu.getDescription())
                .price(menu.getPrice())
                .imageUrl(menu.getImageUrl())
                .userId(menu.getUser() != null ? menu.getUser().getId() : null)
                .build();
    }

    // 메뉴 등록
    public MenuResponse createMenu(Long userId, MenuRequest request) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Integer maxId = menuRepository.findMaxUserMenuId(user);
        Menu menu = new Menu();
        menu.setUser(user);
        menu.setUserMenuId(maxId + 1);
        menu.setNameKo(request.getMenuName());
        menu.setDescription(request.getMenuDescription());
        menu.setPrice(request.getMenuPrice());

        menuRepository.save(menu);

        return MenuResponse.builder()
                .id(menu.getId())
                .userMenuId(menu.getUserMenuId())
                .nameKo(menu.getNameKo())
                .description(menu.getDescription())
                .price(menu.getPrice())
                .imageUrl(menu.getImageUrl())
                .userId(user.getId())
                .build();
    }

    // 메뉴 등록 (이미지 포함)
    @Transactional
    public MenuResponse createMenuWithImage(Long userId, MenuRequest request, MultipartFile image) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Integer maxId = menuRepository.findMaxUserMenuId(user);

        Menu menu = new Menu();
        menu.setUser(user);
        menu.setUserMenuId(maxId + 1);
        menu.setNameKo(request.getMenuName());
        menu.setDescription(request.getMenuDescription());
        menu.setPrice(request.getMenuPrice());

        // 이미지가 제공된 경우 처리
        if (image != null && !image.isEmpty()) {
            try {
                // 이미지를 S3에 업로드하고 URL을 메뉴에 설정
                String imageUrl = s3Service.uploadImage(image, userId, maxId + 1);
                menu.setImageUrl(imageUrl);
                log.info("메뉴 이미지 등록: {}", imageUrl);
            } catch (Exception e) {
                log.error("이미지 저장 실패: {}", e.getMessage());
            }
        }

        menuRepository.save(menu);

        return MenuResponse.builder()
                .id(menu.getId())
                .userMenuId(menu.getUserMenuId())
                .nameKo(menu.getNameKo())
                .description(menu.getDescription())
                .price(menu.getPrice())
                .imageUrl(menu.getImageUrl())
                .userId(user.getId())
                .build();
    }

    // 메뉴 수정
    public MenuResponse updateMenu(Long userId, Integer userMenuId, MenuRequest request) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Menu menu = menuRepository.findByUserAndUserMenuId(user, userMenuId)
                .orElseThrow(() -> new RuntimeException("사용자 소유의 메뉴가 아닙니다."));

        menu.setNameKo(request.getMenuName());
        menu.setDescription(request.getMenuDescription());
        menu.setPrice(request.getMenuPrice());

        menuRepository.save(menu);

        return MenuResponse.builder()
                .id(menu.getId())
                .userMenuId(menu.getUserMenuId())
                .nameKo(menu.getNameKo())
                .description(menu.getDescription())
                .price(menu.getPrice())
                .imageUrl(menu.getImageUrl())
                .userId(user.getId())
                .build();
    }

    // 메뉴 수정 (이미지 포함)
    public MenuResponse updateMenuWithImage(Long userId, Integer userMenuId, MenuRequest request, MultipartFile image) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Menu menu = menuRepository.findByUserAndUserMenuId(user, userMenuId)
                .orElseThrow(() -> new RuntimeException("사용자 소유의 메뉴가 아닙니다."));

        // 메뉴 정보 업데이트
        menu.setNameKo(request.getMenuName());
        menu.setDescription(request.getMenuDescription());
        menu.setPrice(request.getMenuPrice());

        // 이미지가 제공된 경우 이미지 처리 로직 추가
        if (image != null && !image.isEmpty()) {
            // 이미지를 S3에 업로드하고 URL을 메뉴에 저장
            try {
                String imageUrl = s3Service.uploadImage(image, userId, userMenuId);
                menu.setImageUrl(imageUrl);
                log.info("이미지 업데이트 완료: {}", image.getOriginalFilename());
            } catch (Exception e) {
                log.error("이미지 저장 실패: {}", e.getMessage());
            }
        }

        menuRepository.save(menu);

        return MenuResponse.builder()
                .id(menu.getId())
                .userMenuId(menu.getUserMenuId())
                .nameKo(menu.getNameKo())
                .description(menu.getDescription())
                .price(menu.getPrice())
                .imageUrl(menu.getImageUrl())
                .userId(user.getId())
                .build();
    }

    // 메뉴 삭제
    public void deleteMenu(Long userId, Integer userMenuId) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Menu menu = menuRepository.findByUserAndUserMenuId(user, userMenuId)
                .orElseThrow(() -> new RuntimeException("사용자 소유의 메뉴가 아닙니다."));

        menuRepository.delete(menu);
    }

    // 메뉴 삭제 (이미지 포함)
    public void deleteMenuWithImage(Long userId, Integer userMenuId) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Menu menu = menuRepository.findByUserAndUserMenuId(user, userMenuId)
                .orElseThrow(() -> new RuntimeException("사용자 소유의 메뉴가 아닙니다."));

        // 이미지 파일이 존재하면 S3에서 삭제
        if (menu.getImageUrl() != null) {
            try {
                s3Service.deleteImage(menu.getImageUrl());
                log.info("이미지 파일 삭제 요청: {}", menu.getImageUrl());
            } catch (Exception e) {
                log.error("이미지 파일 삭제 실패: {}", e.getMessage());
            }
        }

        menuRepository.delete(menu);
    }

    /**
     * 특정 사용자의 메뉴 정보를 요청된 언어로 조회
     * 해당 언어로 번역된 메뉴가 없으면 자동 번역 후 저장
     */
    @Transactional
    public List<MenuInfo> getMenuInfoByLanguage(Long userId, String langCode) {
        // 사용자 존재 여부 확인
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));

        // 지원 언어 검증
        validateLanguageCode(langCode);

        // 해당 언어로 이미 번역된 메뉴가 있는지 확인
        List<Menu> existingMenus = menuRepository.findByUserIdAndLanguage(userId, langCode);

        if (!existingMenus.isEmpty()) {
            // 이미 번역된 메뉴가 있으면 바로 반환
            log.info("사용자 {}의 {} 언어 메뉴 {}개를 조회했습니다.", userId, langCode, existingMenus.size());
            return existingMenus.stream()
                    .map(this::convertToMenuInfo)
                    .collect(Collectors.toList());
        }

        // 번역된 메뉴가 없으면 한국어 메뉴를 찾아서 번역
        List<Menu> koreanMenus = findKoreanMenusByUserId(userId);

        if (koreanMenus.isEmpty()) {
            log.info("사용자 {}의 한국어 메뉴가 없습니다.", userId);
            return new ArrayList<>();
        }

        // 한국어 메뉴를 요청된 언어로 번역하고 저장
        List<MenuInfo> translatedMenus = new ArrayList<>();
        for (Menu koreanMenu : koreanMenus) {
            Menu translatedMenu = translateAndSaveMenu(koreanMenu, langCode);
            translatedMenus.add(convertToMenuInfo(translatedMenu));
        }

        log.info("사용자 {}의 메뉴 {}개를 {} 언어로 번역하여 저장했습니다.", userId, translatedMenus.size(), langCode);
        return translatedMenus;
    }

    @Transactional(readOnly = true)
    public List<MenuInfo> getExistingMenusByLanguage(Long userId, String langCode) {
        // 사용자 존재 여부 확인
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));

        // 지원 언어 검증
        validateLanguageCode(langCode);

        // 해당 언어로 이미 번역된 메뉴만 조회
        List<Menu> existingMenus = menuRepository.findByUserIdAndLanguage(userId, langCode);

        return existingMenus.stream()
                .map(this::convertToMenuInfo)
                .collect(Collectors.toList());
    }

    /**
     * 사용자의 메뉴와 식당 정보를 요청된 언어로 조회
     */
    @Transactional(readOnly = true)
    public MenuWithRestaurantResponse getMenuWithRestaurant(Long userId, String langCode) {
        // 사용자 존재 여부 확인
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));

        // 지원 언어 검증
        validateLanguageCode(langCode);

        // 식당 정보 조회
        RestaurantInfoResponse restaurantInfo = getRestaurantInfoByLanguage(user, langCode);

        // 메뉴 정보 조회 (해당 언어로)
        List<MenuInfo> menuInfoList = getMenuInfoByLanguage(userId, langCode);

        return MenuWithRestaurantResponse.builder()
                .restaurantInfo(restaurantInfo)
                .menuList(menuInfoList)
                .build();
    }

    /**
     * 사용자의 메뉴를 요청된 언어로 조회하여 MenuResponse 형태로 반환
     */
    private List<MenuResponse> getMenusByLanguageForResponse(Long userId, String langCode) {
        List<Menu> menus;
        
        if ("ko".equals(langCode)) {
            // 한국어 메뉴 조회
            menus = findKoreanMenusByUserId(userId);
        } else {
            // 번역된 메뉴 조회
            menus = menuRepository.findByUserIdAndLanguage(userId, langCode);
            
            // 번역된 메뉴가 없으면 한국어 메뉴를 번역
            if (menus.isEmpty()) {
                List<Menu> koreanMenus = findKoreanMenusByUserId(userId);
                for (Menu koreanMenu : koreanMenus) {
                    try {
                        Menu translatedMenu = translateAndSaveMenu(koreanMenu, langCode);
                        menus.add(translatedMenu);
                    } catch (Exception e) {
                        log.warn("메뉴 번역 실패: {}", e.getMessage());
                        // 번역 실패 시 한국어 메뉴 사용
                        menus.add(koreanMenu);
                    }
                }
            }
        }

        return menus.stream()
                .map(menu -> MenuResponse.builder()
                        .id(menu.getId())
                        .userMenuId(menu.getUserMenuId())
                        .nameKo(menu.getNameKo())
                        .description(menu.getDescription())
                        .price(menu.getPrice())
                        .userId(userId)
                        .build())
                .toList();
    }

    /**
     * 사용자의 식당 정보를 요청된 언어로 조회
     */
    private RestaurantInfoResponse getRestaurantInfoByLanguage(SiteUser user, String langCode) {
        String restaurantName = user.getRestaurantName();
        String restaurantAddress = user.getRestaurantAddress();
        String shortDescription = user.getShortDescription();
        String longDescription = user.getLongDescription();

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
            } catch (Exception e) {
                log.warn("식당 정보 번역 실패: {}", e.getMessage());
                // 번역 실패 시 원본 텍스트 사용
            }
        }

        // features 조회 (현재는 기본값 사용, 필요시 StoreFeature 엔티티 활용)
        List<String> features = List.of("Free Wi-Fi", "Parking available"); // TODO: 실제 features 조회 로직 구현

        return RestaurantInfoResponse.builder()
                .restaurantName(restaurantName)
                .restaurantAddress(restaurantAddress)
                .shortDescription(shortDescription)
                .longDescription(longDescription)
                .tableCount(10) // TODO: 실제 테이블 수 조회 로직 구현
                .features(features)
                .build();
    }

    /**
     * 텍스트를 지정된 언어로 번역
     */
    private String translateText(String text, String targetLangCode) {
        TranslationRequest request = TranslationRequest.builder()
                .text(text)
                .build();

        String targetLanguage = getTargetLanguageName(targetLangCode);
        return translationService.translate(request, targetLanguage, null).getTranslatedText();
    }

    /**
     * 사용자의 한국어 메뉴 조회
     */
    private List<Menu> findKoreanMenusByUserId(Long userId) {
        List<Menu> allMenus = menuRepository.findByUserIdOrderByUserMenuIdAndLanguage(userId);
        
        // 한국어 메뉴만 필터링 (language가 null이거나 "ko"인 경우)
        return allMenus.stream()
                .filter(menu -> menu.getLanguage() == null || "ko".equals(menu.getLanguage()))
                .collect(Collectors.toList());
    }

    /**
     * 메뉴를 요청된 언어로 번역하고 저장
     */
    @Transactional
    public Menu translateAndSaveMenu(Menu koreanMenu, String targetLangCode) {
        try {
            // 메뉴명 번역
            String translatedName = translateMenuName(koreanMenu.getNameKo(), targetLangCode);
            
            // 메뉴 설명 번역
            String translatedDescription = null;
            if (koreanMenu.getDescription() != null && !koreanMenu.getDescription().isEmpty()) {
                translatedDescription = translateMenuDescription(koreanMenu.getDescription(), targetLangCode);
            }

            // 번역된 메뉴 생성
            Menu translatedMenu = new Menu();
            translatedMenu.setUserMenuId(koreanMenu.getUserMenuId());
            translatedMenu.setNameKo(translatedName);
            translatedMenu.setPrice(koreanMenu.getPrice());
            translatedMenu.setDescription(translatedDescription);
            translatedMenu.setLanguage(targetLangCode);
            translatedMenu.setUser(koreanMenu.getUser());

            // 저장
            Menu savedMenu = menuRepository.save(translatedMenu);
            log.info("메뉴 번역 완료: {} -> {} (언어: {})", koreanMenu.getNameKo(), translatedName, targetLangCode);
            
            return savedMenu;
            
        } catch (Exception e) {
            log.error("메뉴 번역 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("메뉴 번역 실패: " + e.getMessage());
        }
    }

    /**
     * 메뉴명 번역
     */
    private String translateMenuName(String koreanName, String targetLangCode) {
        TranslationRequest request = TranslationRequest.builder()
                .text(koreanName)
                .menuName(koreanName)
                .build();

        String targetLanguage = getTargetLanguageName(targetLangCode);
        return translationService.translate(request, targetLanguage, null).getTranslatedText();
    }

    /**
     * 메뉴 설명 번역
     */
    private String translateMenuDescription(String koreanDescription, String targetLangCode) {
        TranslationRequest request = TranslationRequest.builder()
                .text(koreanDescription)
                .description(koreanDescription)
                .build();

        String targetLanguage = getTargetLanguageName(targetLangCode);
        return translationService.translate(request, targetLanguage, null).getTranslatedText();
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

    /**
     * 언어 코드 검증
     */
    private void validateLanguageCode(String langCode) {
        if (langCode == null || !List.of("en", "ch", "ja").contains(langCode.toLowerCase())) {
            throw new IllegalArgumentException("지원하지 않는 언어 코드입니다. 'en', 'ch', 'ja' 중 하나를 사용해주세요.");
        }
    }

    /**
     * Menu 엔티티를 MenuInfo DTO로 변환
     */
    private MenuInfo convertToMenuInfo(Menu menu) {
        return MenuInfo.builder()
                .menuId(menu.getId())
                .userId(menu.getUserId())
                .nameKo(menu.getNameKo())
                .userMenuId(menu.getUserMenuId())
                .description(menu.getDescription())
                .price(menu.getPrice())
                .language(menu.getLanguage())
                .build();
    }


}