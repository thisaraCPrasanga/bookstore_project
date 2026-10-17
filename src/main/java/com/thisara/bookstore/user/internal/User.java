package com.thisara.bookstore.user.internal;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Locale;
import java.util.Objects;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String passwordHash;
    private String firstName;
    private String lastName;
    private String phone;

    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean enabled;

    @Column(updatable = false)
    private Instant createdAt;

    private Instant updatedAt;

    public User(String email,String passwordHash,String firstName,String lastName){
        this.email = email.trim().toLowerCase(Locale.ROOT);
        this.passwordHash=passwordHash;
        this.firstName=firstName;
        this.lastName=lastName;
        this.role=Role.CUSTOMER;
        this.enabled=true;
    }

    public void changeRole(Role newRole){
        this.role= Objects.requireNonNull(newRole,"role must not be null");
    }

    @PrePersist
    void onCreate(){
        Instant now = Instant.now();
        this.createdAt= now;
        this.updatedAt=now;
    }


    @PreUpdate
    void onUpdate(){
        this.updatedAt=Instant.now();
    }


}
