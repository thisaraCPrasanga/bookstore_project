package com.thisara.bookstore.user.internal;

import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
class AdminInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    AdminInitializer(UserRepository userRepository,
                     PasswordEncoder passwordEncoder,
                     @Value("${app.admin.email}") String adminEmail,
                     @Value("${app.admin.password}") String adminPassword){
        this.userRepository=userRepository;
        this.passwordEncoder=passwordEncoder;
        this.adminEmail=adminEmail;
        this.adminPassword=adminPassword;
    }

    @Override
    @Transactional
    public void run (ApplicationArguments args){
        if(userRepository.existsByRole(Role.ADMIN)){
            return;
        }

        String email = User.normalizeEmail(adminEmail);

        if (userRepository.existsByEmail(email)){
            throw new IllegalStateException("ADMIN_EMAIL is Already Exists by a Customer: "+email);
        }

        User admin = new User(
                email,
                passwordEncoder.encode(adminPassword),
                "shop",
                "admin"
        );
        admin.changeRole(Role.ADMIN);
        userRepository.save(admin);

        log.info("Created first admin:{}",email);
    }

}
