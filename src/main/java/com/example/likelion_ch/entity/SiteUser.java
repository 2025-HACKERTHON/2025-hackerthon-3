package com.example.likelion_ch.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
public class SiteUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String password;

    // 2단계 회원가입에 필요한 필드 추가
    private String restaurantName;
    private String restaurantAddress;

    @Column(length = 200)
    private String shortDescription;

    @Column(columnDefinition = "TEXT")
    private String longDescription;
    private Integer tableCount;

    @Column(name = "gemini_api_key", length = 500)
    @JsonIgnore
    private String geminiApiKey;      // 사용자별 Gemini API 키

    @CreatedDate
    @Column(name = "created_at")
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_features",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "feature_id")
    )
    @JsonManagedReference
    private Set<StoreFeature> features = new HashSet<>();

    public RestaurantInfo getRestaurantInfo() {
        RestaurantInfo info = new RestaurantInfo();
        info.setRestaurantName(this.restaurantName);
        info.setRestaurantAddress(this.restaurantAddress);
        info.setShortDescription(this.shortDescription);
        info.setLongDescription(this.longDescription);
        // features는 Service에서 따로 세팅
        return info;
    }
}