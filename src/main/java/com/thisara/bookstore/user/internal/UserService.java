package com.thisara.bookstore.user.internal;

import com.thisara.bookstore.security.JwtUtil;
import com.thisara.bookstore.shared.ConflictException;
import com.thisara.bookstore.shared.InvalidCredentialsException;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
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

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest loginRequest) {
        String email = User.normalizeEmail(loginRequest.email());

        User user = userRepository.findByEmail(email)
                .orElseThrow(InvalidCredentialsException::new);

        if (!user.isEnabled()
                || !passwordEncoder.matches(loginRequest.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return new LoginResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole()
        );
    }

}
