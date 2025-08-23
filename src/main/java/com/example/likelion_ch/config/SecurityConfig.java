package com.example.likelion_ch.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpMethod;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // 회원가입, 로그인 경로에 대한 모든 요청 허용
                        .requestMatchers("/api/**").permitAll()
                        .requestMatchers("/api/user/register/**", "/api/user/login", "/api/store/**", "/api/cart/**","/api/order-ratings/**","/api/orders/**").permitAll()
                        .requestMatchers("/api/orders/current").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/store/**").permitAll()
                        .anyRequest().authenticated()

                )
                .formLogin(form -> form.disable()) // 기본 HTML 로그인 폼 비활성화
                .httpBasic(httpBasic -> httpBasic.disable()); // HTTP Basic도 비활성화
        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}