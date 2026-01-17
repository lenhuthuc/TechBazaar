package com.trash.ecommerce.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ProductDetailsResponseDTO {
    private Long id;
    private String product_name;
    private BigDecimal price;
    private Long quantity;
    private String category;
    private String description;
    private String image;
    private Integer ratingCount;
    private Double rating;
}

