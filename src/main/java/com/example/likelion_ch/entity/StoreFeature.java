package com.example.likelion_ch.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "store_features")
@Getter
@Setter
public class StoreFeature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long featureId;

    @Column(length = 100, nullable = false, unique = true)
    private String name;

    @ManyToMany(mappedBy = "features")
    @JsonBackReference
    private Set<SiteUser> users = new HashSet<>();

    // JPA용 기본 생성자
    public StoreFeature() {
    }

    public StoreFeature(String name) {
        this.name = name;
    }
}
