package com.tavia.crm_service.config;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Simple SHA-256 based password hasher with salt.
 * Used instead of BCrypt to avoid pulling in spring-security dependency.
 * Format: base64(salt):base64(hash)
 */
public class PasswordHasher {

    private static final int SALT_LENGTH = 16;

    public String hash(String rawPassword) {
        byte[] salt = new byte[SALT_LENGTH];
        try {
            SecureRandom.getInstance("SHA1PRNG").nextBytes(salt);
        } catch (NoSuchAlgorithmException e) {
            new SecureRandom().nextBytes(salt);
        }
        byte[] hash = computeHash(rawPassword, salt);
        return Base64.getEncoder().encodeToString(salt) + ":" + Base64.getEncoder().encodeToString(hash);
    }

    public boolean verify(String rawPassword, String storedHash) {
        if (storedHash == null || !storedHash.contains(":")) {
            return false;
        }
        String[] parts = storedHash.split(":");
        byte[] salt = Base64.getDecoder().decode(parts[0]);
        byte[] expectedHash = Base64.getDecoder().decode(parts[1]);
        byte[] actualHash = computeHash(rawPassword, salt);
        return MessageDigest.isEqual(expectedHash, actualHash);
    }

    private byte[] computeHash(String password, byte[] salt) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            digest.update(salt);
            return digest.digest(password.getBytes());
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
