package com.example.likelion_ch.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UserRegisterStep1Request {
    private String email;
    private String password;
    private String confirmPassword;
}