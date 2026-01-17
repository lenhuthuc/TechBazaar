package com.trash.ecommerce.exception;

public class ProductQuantityValidation extends RuntimeException {
    public ProductQuantityValidation(String message) {
        super(message);
    }
}
