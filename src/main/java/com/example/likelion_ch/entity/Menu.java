package com.example.likelion_ch.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "menus")
@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "menu_id")
    private Long id;

    private Integer userMenuId; // 사용자별 메뉴 ID

    @Column(name = "name_ko", length = 100, nullable = false)
    private String nameKo;            // 한글 메뉴명

    @Column(precision = 10, scale = 2)
    private BigDecimal price;          // 가격 (BigDecimal, scale=2)

    @Column(length = 500)
    private String description;        // 메뉴 설명

    @Column(length = 10)
    private String language;

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    @Column(length = 500)
    private String imageUrl;          // S3에 업로드된 이미지의 접근 가능한 URL

    @Version
    private Long version;              // Optimistic Lock

    @CreatedDate
    @Column(name = "created_at")
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private SiteUser user;

    // userId 필드 추가
    @Column(name = "user_id", insertable = false, updatable = false)
    private Long userId;

    // 기본 생성자
    public Menu() {}

    // 언어별 메뉴 조회용 생성자 (ID, 이름, 설명, 가격만 사용)
    public Menu(Long id, String name, String description, BigDecimal price) {
        this.id = id;
        this.nameKo = name;        // ko 기본으로 저장
        this.description = description;
        this.price = price;
    }

    @OneToMany(mappedBy = "menu")
    @JsonIgnore
    private List<OrderItem> orderItems;

    public String getMenuName() {
        return this.nameKo;
    }
    public void setMenuName(String menuName) {
        this.nameKo = menuName;
    }

    // userId getter 추가
    public Long getUserId() {
        return this.user != null ? this.user.getId() : null;
    }

    //언어
    @Column(name = "name_en", length = 100)
    private String nameEn;

    @Column(name = "name_ja", length = 100)
    private String nameJa;

    @Column(name = "name_ch", length = 100)
    private String nameCh;

    @Column(length = 500)
    private String descriptionEn;

    @Column(length = 500)
    private String descriptionJa;

    @Column(length = 500)
    private String descriptionCh;

    // 각 언어 getter 추가
    public String getNameEn() { return this.nameEn; }
    public String getNameJa() { return this.nameJa; }
    public String getNameCh() { return this.nameCh; }

    public String getDescriptionEn() { return this.descriptionEn; }
    public String getDescriptionJa() { return this.descriptionJa; }
    public String getDescriptionCh() { return this.descriptionCh; }

}
