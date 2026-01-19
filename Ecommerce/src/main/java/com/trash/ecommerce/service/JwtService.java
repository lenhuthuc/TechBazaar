package com.trash.ecommerce.service;

import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

import com.trash.ecommerce.dto.Token;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService; // Thêm import này
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
    private String secretKey = "Banana";

    // 1. XÓA dòng private UserDetails userDetails; (Nguy hiểm, gây lỗi Null và lỗi luồng)

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    // 2. Inject UserDetailsService để dùng trong hàm refreshToken
    @Autowired
    private UserDetailsService userDetailsService;

    public JwtService() {
        try {
            KeyGenerator keyGenerator = KeyGenerator.getInstance("HmacSHA256");
            SecretKey sk = keyGenerator.generateKey();
            secretKey = Base64.getEncoder().encodeToString(sk.getEncoded());
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    public Token generateToken(UserDetails userDetails, Long id) {
        Map<String, Object> claims = new HashMap<>();
        Token token = new Token();
        
        claims.put("id", id);
        
        List<String> roles = userDetails.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList());
        claims.put("roles", roles);

        token.setAccess(
                Jwts.builder()
                        .claims()
                        .add(claims)
                        .subject(userDetails.getUsername()) // Lấy email từ userDetails
                        .issuedAt(new Date(System.currentTimeMillis()))
                        .expiration(new Date(System.currentTimeMillis() + 3 * 60 * 60 * 1000))
                        .and()
                        .signWith(getKey())
                        .compact()
        );
        token.setRefresh(
                Jwts.builder()
                        .claims()
                        .add(claims)
                        .subject(userDetails.getUsername())
                        .issuedAt(new Date(System.currentTimeMillis()))
                        .expiration(new Date(System.currentTimeMillis() + 3 * 60 * 60 * 1000))
                        .and()
                        .signWith(getKey())
                        .compact()
        );
        String refreshTokenValue = token.getRefresh();
        if (refreshTokenValue != null) {
            redisTemplate.opsForValue().set("refresh:" + String.valueOf(id), refreshTokenValue, 3 * 60 * 60, TimeUnit.SECONDS);
        }
        return token;
    }

    private SecretKey getKey() {
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private String removeBearerPrefix(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            return token.substring(7);
        }
        return token;
    }

    public Long extractId(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token cannot be null or empty");
        }
        token = removeBearerPrefix(token);
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid token format");
        }
        Claims claims = extractAllClaims(token);
        Long id = claims.get("id", Long.class);
        if (id == null) {
            throw new IllegalArgumentException("Token does not contain user ID");
        }
        return id;
    }
    
    public String extractUsername(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token cannot be null or empty");
        }
        token = removeBearerPrefix(token);
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function <Claims, T> claimResolve) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token cannot be null or empty");
        }
        token = removeBearerPrefix(token);
        Claims claims = extractAllClaims(token);
        return claimResolve.apply(claims);
    }

    public Claims extractAllClaims(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token cannot be null or empty");
        }
        try {
            return Jwts.parser()
                        .verifyWith(getKey())
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid token: " + e.getMessage(), e);
        }
    }

    public boolean validationTokenCheck(String token, UserDetails userDetails) {
        if (token == null || userDetails == null) {
            return false;
        }
        try {
            String username = extractUsername(token);
            return username != null && username.equals(userDetails.getUsername()) && !isExpiration(token);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isExpiration(String token) {
        try {
            Date expiration = extractExpiration(token);
            return expiration != null && expiration.before(new Date());
        } catch (Exception e) {
            return true; 
        }
    }

    public Date extractExpiration(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token cannot be null or empty");
        }
        token = removeBearerPrefix(token);
        return extractClaim(token, Claims::getExpiration);
    }

    public Token refreshToken(String oldRefreshToken) {
        if (oldRefreshToken == null || oldRefreshToken.trim().isEmpty()) {
            return null;
        }
        
        String cleanToken = removeBearerPrefix(oldRefreshToken);
        if (cleanToken == null || cleanToken.trim().isEmpty()) {
            return null;
        }
        
        try {
            Long userId = extractId(oldRefreshToken); 
            String storedToken = (String) redisTemplate.opsForValue().get("refresh:" + userId);
            
            if (storedToken == null || !storedToken.equals(cleanToken)) {
                return null;
            }
            
            if (isExpiration(storedToken)) {
                return null;
            }
            
            redisTemplate.delete("refresh:" + userId);
            String username = extractUsername(storedToken);

            // 5. Load UserDetails từ DB để lấy quyền mới nhất
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // 6. Gọi generateToken với userDetails vừa load được
            Token token = generateToken(userDetails, userId);

            String newRefreshToken = token.getRefresh();
            if (newRefreshToken != null) {
                redisTemplate.opsForValue().set(
                        "refresh:" + userId,
                        newRefreshToken,
                        3, TimeUnit.HOURS
                );
            }
            return token;
        } catch (Exception e) {
            return null;
        }
    }
}