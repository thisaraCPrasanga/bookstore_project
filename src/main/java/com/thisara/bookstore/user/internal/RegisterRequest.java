package com.thisara.bookstore.user.internal;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        @Size(max = 255, message = "Email must be at most {max} characters")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 72, message = "Password must be {min} to {max} characters")
        String password,

        @NotBlank(message = "First name is required")
        @Size(max = 100, message = "First name must be at most {max} characters")
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(max = 100, message = "Last name must be at most {max} characters")
        String lastName
) {

    @Override
    public String toString() {
        return "RegisterRequest[email=" + email
                + ", firstName=" + firstName
                + ", lastName=" + lastName + "]";
    }
}
