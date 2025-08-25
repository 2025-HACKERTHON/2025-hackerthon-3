package com.example.likelion_ch.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class S3ServiceTest {

    @Mock
    private S3Client s3Client;

    private S3Service s3Service;

    @BeforeEach
    void setUp() {
        s3Service = new S3Service(s3Client);

        // 테스트용 필드 값 주입 (실제에선 @Value로 주입됨)
        // reflection 사용 없이 단순히 Mock URL 검증 용도로 가짜 값 세팅
        try {
            java.lang.reflect.Field bucketField = S3Service.class.getDeclaredField("bucketName");
            bucketField.setAccessible(true);
            bucketField.set(s3Service, "mystore-menu-images");

            java.lang.reflect.Field regionField = S3Service.class.getDeclaredField("region");
            regionField.setAccessible(true);
            regionField.set(s3Service, "ap-northeast-2");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void uploadImage_ValidImage_ShouldReturnImageUrl() throws IOException {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "image",
                "test.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenReturn(null);

        // When
        String url = s3Service.uploadImage(file, 1L, 1);

        // Then
        assertTrue(url.contains("menu/1/1.jpg"));
        verify(s3Client, times(1)).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void uploadImage_InvalidFileSize_ShouldThrowException() {
        // Given: 6MB짜리 파일 (5MB 초과)
        byte[] largeContent = new byte[6 * 1024 * 1024];
        MockMultipartFile file = new MockMultipartFile(
                "image",
                "large.jpg",
                "image/jpeg",
                largeContent
        );

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            s3Service.uploadImage(file, 1L, 1);
        });
        verifyNoInteractions(s3Client);
    }

    @Test
    void uploadImage_InvalidFileExtension_ShouldThrowException() {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "image",
                "test.txt",
                "text/plain",
                "test content".getBytes()
        );

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            s3Service.uploadImage(file, 1L, 1);
        });
        verifyNoInteractions(s3Client);
    }

    @Test
    void deleteImage_ValidUrl_ShouldCallS3Delete() {
        // Given
        String imageUrl = "https://mystore-menu-images.s3.ap-northeast-2.amazonaws.com/menu/1/1.jpg";

        when(s3Client.deleteObject(any(DeleteObjectRequest.class)))
                .thenReturn(null);

        // When
        s3Service.deleteImage(imageUrl);

        // Then
        verify(s3Client, times(1)).deleteObject(any(DeleteObjectRequest.class));
    }
}
