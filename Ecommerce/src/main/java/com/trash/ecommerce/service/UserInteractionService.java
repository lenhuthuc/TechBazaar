package com.trash.ecommerce.service;

import java.util.List;

import com.trash.ecommerce.dto.ProductDetailsResponseDTO;
import com.trash.ecommerce.entity.UserInteractions;

public interface UserInteractionService {
    public UserInteractions recordInteraction(Long userId, Long productId);
    public List<ProductDetailsResponseDTO> getUserInteractions(Long userId);
    public List<UserInteractions> getProductInteractions(Long productId);
    public List<UserInteractions> getUserProductInteractions(Long userId, Long productId);
}
