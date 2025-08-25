package com.example.likelion_ch.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    @Value("${cloud.aws.region.static}")
    private String region;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "svg");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    /**
     * 이미지 파일 업로드
     */
    public String uploadImage(MultipartFile file, Long userId, Integer userMenuId) throws IOException {
        // 파일 검증
        validateImageFile(file);

        // 파일 확장자 추출
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        
        // S3 키 생성 (menu/{userId}/{userMenuId}.{extension})
        String s3Key = String.format("menu/%d/%d.%s", userId, userMenuId, extension);

        try {
            // S3에 업로드
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // 업로드된 이미지의 URL 생성
            String imageUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, s3Key);
            
            log.info("이미지 업로드 완료: {}", imageUrl);
            return imageUrl;

        } catch (S3Exception e) {
            log.error("S3 업로드 실패: {}", e.getMessage());
            throw new RuntimeException("이미지 업로드에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 이미지 파일 삭제
     */
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return;
        }

        try {
            // URL에서 S3 키 추출
            String s3Key = extractS3KeyFromUrl(imageUrl);
            
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("이미지 삭제 완료: {}", s3Key);

        } catch (S3Exception e) {
            log.error("S3 삭제 실패: {}", e.getMessage());
            // 삭제 실패 시에도 예외를 던지지 않음 (메뉴 삭제는 계속 진행)
        }
    }

    /**
     * 이미지 파일 검증
     */
    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("이미지 파일이 없습니다.");
        }

        // 파일 크기 검증
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("파일 크기가 5MB를 초과합니다.");
        }

        // 파일 확장자 검증
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new IllegalArgumentException("파일명이 없습니다.");
        }

        String extension = getFileExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("지원하지 않는 파일 형식입니다. jpg, jpeg, png, svg만 허용됩니다.");
        }
    }

    /**
     * 파일 확장자 추출
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }

    /**
     * S3 URL에서 키 추출
     */
    private String extractS3KeyFromUrl(String imageUrl) {
        // https://bucket-name.s3.region.amazonaws.com/menu/userId/userMenuId.jpg
        String prefix = String.format("https://%s.s3.%s.amazonaws.com/", bucketName, region);
        if (imageUrl.startsWith(prefix)) {
            return imageUrl.substring(prefix.length());
        }
        throw new IllegalArgumentException("잘못된 S3 URL 형식입니다: " + imageUrl);
    }
}
