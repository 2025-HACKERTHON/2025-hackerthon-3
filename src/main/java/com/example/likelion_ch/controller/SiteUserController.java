package com.example.likelion_ch.controller;

import com.example.likelion_ch.dto.UserLoginRequest;
import com.example.likelion_ch.dto.UserLoginResponse;
import com.example.likelion_ch.dto.UserRegisterStep1Request;
import com.example.likelion_ch.dto.UserRegisterStep2Request;
import com.example.likelion_ch.entity.SiteUser; // SiteUser 엔티티 import
import com.example.likelion_ch.service.SiteUserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class SiteUserController {

    private final SiteUserService siteUserService;

    public SiteUserController(SiteUserService siteUserService) {
        this.siteUserService = siteUserService;
    }

    // 1단계 회원가입: SiteUser를 반환하도록 수정
    @PostMapping("/register/step1")
    public ResponseEntity<SiteUser> registerStep1(@RequestBody UserRegisterStep1Request request) {
        SiteUser newUser = siteUserService.registerStep1(request);
        return ResponseEntity.ok(newUser);
    }

    // 2단계 회원가입: SiteUser를 반환하도록 수정
    @PostMapping("/register/step2/{userId}")
    public ResponseEntity<?> registerStep2(@PathVariable Long userId,
                                           @RequestBody UserRegisterStep2Request request) {
        SiteUser updatedUser = siteUserService.registerStep2(userId, request);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<UserLoginResponse> login(@RequestBody UserLoginRequest request, HttpSession session) {
        SiteUser user = siteUserService.login(request);

        // Spring Security 인증 컨텍스트에 등록
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(user, null, List.of());
        SecurityContextHolder.getContext().setAuthentication(authToken);

        // 세션에도 저장
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                SecurityContextHolder.getContext());

        // DTO 응답
        UserLoginResponse response = new UserLoginResponse();
        response.setId(user.getId());
        response.setRestaurantName(user.getRestaurantName());
        response.setEmail(user.getEmail());
        response.setTableCount(user.getTableCount());

        return ResponseEntity.ok(response);
    }
}