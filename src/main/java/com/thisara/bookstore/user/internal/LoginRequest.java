package com.thisara.bookstore.user.internal;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,

        @NotBlank(message = "Password is required")
        String password
) {

        @Override
        public String toString(){
                return "LoginRequest[email="+ email + "]";
        }
}
