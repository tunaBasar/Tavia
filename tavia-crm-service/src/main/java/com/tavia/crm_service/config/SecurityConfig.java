package com.tavia.crm_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Provides a simple BCrypt-based password hashing utility.
 * We don't use Spring Security starter to avoid pulling in the full security filter chain.
 * This uses the standalone spring-security-crypto module.
 */
@Configuration
public class SecurityConfig {

    @Bean
    public PasswordHasher passwordHasher() {
        return new PasswordHasher();
    }
}
