package com.example.likelion_ch;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class LikelionChApplication {

	public static void main(String[] args) {
		SpringApplication.run(LikelionChApplication.class, args);
	}

}
