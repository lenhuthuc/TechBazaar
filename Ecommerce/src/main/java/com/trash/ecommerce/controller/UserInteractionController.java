package com.trash.ecommerce.controller;

import com.trash.ecommerce.dto.ProductDetailsResponseDTO;
import com.trash.ecommerce.service.JwtService;
import com.trash.ecommerce.service.UserInteractionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for User Interactions and Recommendations
 * 
 * Endpoints:
 * - POST /api/interactions/record - Record a user viewing/interacting with a product
 * - GET /api/interactions/my-recommendations - Get personalized product recommendations for current user
 * - GET /interactions/product/{productId} - Get all users who interacted with a product (admin only)
 */
@RestController
@RequestMapping("/api/interactions")
public class UserInteractionController {
    
    private Logger logger = LoggerFactory.getLogger(UserInteractionController.class);
    
    @Autowired
    private UserInteractionService userInteractionService;
    
    @Autowired
    private JwtService jwtService;
    
    /**
     * Record a user interaction (view/click) with a product
     * This helps build the user interaction history for recommendations
     */
    @PostMapping("/record")
    public ResponseEntity<?> recordInteraction(
        @RequestHeader("Authorization") String token,
        @RequestParam Long productId
    ) {
        try {
            Long userId = jwtService.extractId(token);
            userInteractionService.recordInteraction(userId, productId);
            return ResponseEntity.ok(java.util.Map.of("message", "Interaction recorded successfully"));
        } catch (Exception e) {
            logger.error("Error recording interaction", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(java.util.Map.of("message", "Error recording interaction: " + e.getMessage()));
        }
    }
    
    /**
     * Get personalized product recommendations based on user's interaction history
     * Uses collaborative filtering or content-based recommendation engine
     */
    @GetMapping("/my-recommendations")
    public ResponseEntity<List<ProductDetailsResponseDTO>> getMyRecommendations(
        @RequestHeader("Authorization") String token
    ) {
        try {
            Long userId = jwtService.extractId(token);
            List<ProductDetailsResponseDTO> recommendations = userInteractionService.getUserInteractions(userId);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            logger.error("Error fetching user recommendations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get all user interactions for a specific product
     * Useful for analytics or admin dashboards
     * NOTE: May require ADMIN role in production
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getProductInteractions(
        @PathVariable Long productId
    ) {
        try {
            var interactions = userInteractionService.getProductInteractions(productId);
            return ResponseEntity.ok(java.util.Map.of(
                "count", interactions.size(),
                "data", interactions
            ));
        } catch (Exception e) {
            logger.error("Error fetching product interactions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
