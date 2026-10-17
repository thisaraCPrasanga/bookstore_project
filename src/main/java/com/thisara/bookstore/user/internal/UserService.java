package com.thisara.bookstore.user.internal;

import com.thisara.bookstore.shared.ConflictException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse register(RegisterRequest registerRequest){
        String email = User.normalizeEmail(registerRequest.email());

        if (userRepository.existsByEmail(email)){
            throw new ConflictException("Email already exists");
        }

        User user = new User(
                email,
                passwordEncoder.encode(registerRequest.password()),
                registerRequest.firstName(),
                registerRequest.lastName()
        );

        User saved = userRepository.save(user);
        return UserResponse.from(saved);


    }
}
