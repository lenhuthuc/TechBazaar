package com.trash.ecommerce.service;

import com.trash.ecommerce.entity.UserInteractions;
import com.trash.ecommerce.entity.Users;
import com.trash.ecommerce.dto.ProductDetailsResponseDTO;
import com.trash.ecommerce.entity.Product;
import com.trash.ecommerce.repository.UserInteractionsRepository;
import com.trash.ecommerce.repository.UserRepository;
import com.trash.ecommerce.repository.ProductRepository;
import com.trash.ecommerce.exception.FindingUserError;
import com.trash.ecommerce.exception.ProductFingdingException;
import com.trash.ecommerce.mapper.ProductMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;

import org.springframework.http.MediaType;
import jakarta.transaction.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class UserInteractionServiceImpl implements UserInteractionService {

    @Autowired
    private UserInteractionsRepository userInteractionsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductMapper productMapper;

    @Transactional
    public UserInteractions recordInteraction(Long userId, Long productId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new FindingUserError("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductFingdingException("Product not found"));

        UserInteractions interaction = new UserInteractions();
        interaction.setUser(user);
        interaction.setProduct(product);
        interaction.setCreatedAt(LocalDateTime.now());

        return userInteractionsRepository.save(interaction);
    }

    public List<ProductDetailsResponseDTO> getUserInteractions(Long userId) {
        List<UserInteractions> userInteractions = userInteractionsRepository.findByUserId(userId);
        if (userInteractions.isEmpty()) {
            throw new RuntimeException("No interactions found for user");
        }
        List<Long> productIdList = userInteractions.stream().map(
            product -> product.getProduct().getId()
        ).toList();
        WebClient webClient = WebClient.create();
        List<Long> result = webClient.post()
            .uri("http://127.0.0.1:8000/recommend_user")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(Map.of(
                "view_ids", productIdList
            ))
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<List<Long>>() {})
            .block();
        return result.stream()
                        .map(id -> productRepository.findById(id)
                        .orElseThrow(() -> new ProductFingdingException("Product not found")))
                        .map(productMapper::mapperProduct)
                        .toList();
    }

    public List<UserInteractions> getProductInteractions(Long productId) {
        return userInteractionsRepository.findByProductId(productId);
    }

    public List<UserInteractions> getUserProductInteractions(Long userId, Long productId) {
        return userInteractionsRepository.findByUserIdAndProductId(userId, productId);
    }
}
