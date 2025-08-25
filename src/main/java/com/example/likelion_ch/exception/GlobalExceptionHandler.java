package com.example.likelion_ch.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {



    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidationException(MethodArgumentNotValidException e) {
        Map<String, Object> errors = new HashMap<>();
        e.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.warn("검증 오류: {}", errors);
        return createProblemDetail(HttpStatus.BAD_REQUEST, "입력값 검증 실패", "입력값을 확인해주세요", errors);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ProblemDetail> handleHttpMessageNotReadableException(HttpMessageNotReadableException e) {
        log.warn("잘못된 JSON 형식: {}", e.getMessage());
        return createProblemDetail(HttpStatus.BAD_REQUEST, "잘못된 요청 형식", "JSON 형식을 확인해주세요");
    }

    // 번역 서비스 관련 예외 처리
    @ExceptionHandler(WebClientResponseException.class)
    public ResponseEntity<ProblemDetail> handleWebClientResponseException(WebClientResponseException e) {
        log.error("외부 API 호출 오류: {}", e.getMessage(), e);
        return createProblemDetail(HttpStatus.BAD_GATEWAY, "번역 서비스 오류", "외부 번역 서비스에 문제가 발생했습니다");
    }

    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<ProblemDetail> handleResourceAccessException(ResourceAccessException e) {
        log.error("외부 API 연결 오류: {}", e.getMessage(), e);
        return createProblemDetail(HttpStatus.GATEWAY_TIMEOUT, "번역 서비스 연결 오류", "번역 서비스 연결에 실패했습니다");
    }

    // 이미지 업로드 관련 예외 처리
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ProblemDetail> handleImageValidationException(IllegalArgumentException e) {
        if (e.getMessage().contains("파일 크기") || e.getMessage().contains("파일 형식") || e.getMessage().contains("파일명")) {
            log.warn("이미지 파일 검증 실패: {}", e.getMessage());
            return createProblemDetail(HttpStatus.BAD_REQUEST, "이미지 파일 오류", e.getMessage());
        }
        // 기존 IllegalArgumentException 처리
        log.warn("잘못된 요청: {}", e.getMessage());
        return createProblemDetail(HttpStatus.BAD_REQUEST, "잘못된 요청", e.getMessage());
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ProblemDetail> handleImageUploadException(RuntimeException e) {
        if (e.getMessage().contains("이미지 업로드") || e.getMessage().contains("S3")) {
            log.error("이미지 업로드 실패: {}", e.getMessage(), e);
            return createProblemDetail(HttpStatus.INTERNAL_SERVER_ERROR, "이미지 업로드 실패", "이미지 업로드 중 오류가 발생했습니다");
        }
        // 기존 RuntimeException 처리
        log.error("런타임 오류: {}", e.getMessage(), e);
        return createProblemDetail(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류", e.getMessage());
    }

    private ResponseEntity<ProblemDetail> createProblemDetail(HttpStatus status, String title, String detail) {
        return createProblemDetail(status, title, detail, null);
    }

    private ResponseEntity<ProblemDetail> createProblemDetail(HttpStatus status, String title, String detail, Map<String, Object> additionalData) {
        ProblemDetail problem = ProblemDetail.builder()
                .timestamp(Instant.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .title(title)
                .detail(detail)
                .additionalData(additionalData)
                .build();

        return ResponseEntity.status(status).body(problem);
    }


    // RFC 7807 Problem Details 표준에 맞는 응답 클래스
    @lombok.Data
    @lombok.Builder
    public static class ProblemDetail {
        private Instant timestamp;
        private int status;
        private String error;
        private String title;
        private String detail;
        private Map<String, Object> additionalData;
    }
}
