package com.example.likelion_ch.service;

import com.example.likelion_ch.dto.StoreUpdateRequest;
import com.example.likelion_ch.entity.RestaurantInfo;
import com.example.likelion_ch.entity.SiteUser;
import com.example.likelion_ch.entity.StoreFeature;
import com.example.likelion_ch.repository.MenuRepository;
import com.example.likelion_ch.repository.SiteUserRepository;
import com.example.likelion_ch.repository.StoreFeatureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StoreService {

    private final SiteUserRepository siteUserRepository;
    private final StoreFeatureRepository storeFeatureRepository;
    private final MenuRepository menuRepository;

    public StoreService(SiteUserRepository siteUserRepository,
                        StoreFeatureRepository storeFeatureRepository,
                        MenuRepository menuRepository) {
        this.siteUserRepository = siteUserRepository;
        this.storeFeatureRepository = storeFeatureRepository;
        this.menuRepository = menuRepository;
    }

    public RestaurantInfo getRestaurantInfoByUserId(Long userId) {
        return siteUserRepository.findById(userId)
                .map(SiteUser::getRestaurantInfo)
                .orElseThrow(() -> new RuntimeException("RestaurantInfo not found for userId: " + userId));
    }

    public List<String> getFeaturesByUserId(Long userId) {
        return storeFeatureRepository.findFeaturesByUserId(userId);
    }

    // 가게 정보 조회 (RestaurantInfo 객체 생성)
    public RestaurantInfo getRestaurantInfoById(Long userId) {
        // 예: SiteUser에서 기본 가게 정보를 가져온다고 가정
        var siteUser = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // features 조회
        List<String> features = storeFeatureRepository.findFeaturesByUserId(userId);

        // RestaurantInfo 객체 생성
        RestaurantInfo restaurant = new RestaurantInfo();
        restaurant.setRestaurantName(siteUser.getRestaurantName());
        restaurant.setRestaurantAddress(siteUser.getRestaurantAddress());
        restaurant.setShortDescription(siteUser.getShortDescription());
        restaurant.setLongDescription(siteUser.getLongDescription());
        restaurant.setFeatures(features);

        return restaurant;
    }

    @Transactional
    public SiteUser updateStore(Long userId, StoreUpdateRequest request) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 기본 정보 업데이트
        if (request.getRestaurantName() != null) user.setRestaurantName(request.getRestaurantName());
        if (request.getRestaurantAddress() != null) user.setRestaurantAddress(request.getRestaurantAddress());
        if (request.getShortDescription() != null) user.setShortDescription(request.getShortDescription());
        if (request.getLongDescription() != null) user.setLongDescription(request.getLongDescription());

        // Features 업데이트
        if (request.getFeatures() != null) {
            user.getFeatures().clear(); // 기존 feature 삭제

            request.getFeatures().stream()
                    .distinct()
                    .map(name -> storeFeatureRepository.findByName(name)
                            .orElseGet(() -> new StoreFeature(name)))
                    .forEach(feature -> {
                        // ManyToMany에서는 user 컬렉션에 feature 추가
                        user.getFeatures().add(feature);
                        feature.getUsers().add(user); // 양방향 설정
                    });
        }

        return siteUserRepository.save(user);
    }

}