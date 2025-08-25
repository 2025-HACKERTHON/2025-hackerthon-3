package com.example.likelion_ch.service;

import com.example.likelion_ch.dto.UserLoginRequest;
import com.example.likelion_ch.dto.UserLoginResponse;
import com.example.likelion_ch.dto.UserRegisterStep1Request;
import com.example.likelion_ch.dto.UserRegisterStep2Request;
import com.example.likelion_ch.entity.SiteUser;
import com.example.likelion_ch.entity.StoreFeature;
import com.example.likelion_ch.repository.SiteUserRepository;
import com.example.likelion_ch.repository.StoreFeatureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SiteUserService {
    private final SiteUserRepository siteUserRepository;
    private final StoreFeatureRepository storeFeatureRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    // 1단계 회원가입: SiteUser 엔티티를 반환하도록 수정
    public SiteUser registerStep1(UserRegisterStep1Request request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
        if (siteUserRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }

        SiteUser user = new SiteUser();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        return siteUserRepository.save(user);
    }

    // 2단계 가게 정보 등록: SiteUser 엔티티를 반환하도록 수정
    public SiteUser registerStep2(Long userId, UserRegisterStep2Request request) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        user.setRestaurantName(request.getRestaurantName());
        user.setRestaurantAddress(request.getRestaurantAddress());
        user.setShortDescription(request.getShortDescription());
        user.setLongDescription(request.getLongDescription());
        user.setTableCount(request.getTableCount());

        // features 처리
        user.getFeatures().clear(); // 기존 컬렉션 초기화
        request.getFeatures().stream()
                .distinct()
                .map(name -> storeFeatureRepository.findByName(name)
                        .orElseGet(() -> new StoreFeature(name)))
                .forEach(feature -> {
                    user.getFeatures().add(feature);     // user 컬렉션에 feature 추가
                    feature.getUsers().add(user);        // 양방향 설정
                });

        return siteUserRepository.save(user);
    }

    // 로그인
    @Transactional(readOnly = true)
    public SiteUser login(UserLoginRequest request) {
        SiteUser user = siteUserRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다."));

        // 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        return user; // 엔티티 직접 반환
    }

    // 사용자 ID로 조회
    @Transactional(readOnly = true)
    public SiteUser getUserById(Long userId) {
        return siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }
}