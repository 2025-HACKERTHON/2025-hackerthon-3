package com.example.likelion_ch.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpMethod;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // CSRF 비활성화
                .authorizeHttpRequests(auth -> auth
                        // 공개 API
                        .requestMatchers("/api/user/register/**", "/api/user/login", "/api/store/**", "/api/cart/**", "/api/order-ratings/**","/api/orders/**").permitAll()
                        .requestMatchers("/", "/public/**").permitAll()
                        .requestMatchers(HttpMethod.PATCH, "/api/store/**").permitAll()
                        // 인증이 필요한 API
                        .requestMatchers("/api/orders/current").authenticated()
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form.disable())  // HTML 로그인 폼 비활성화
                .httpBasic(httpBasic -> httpBasic.disable()); // HTTP Basic 비활성화

        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
