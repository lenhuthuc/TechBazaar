package com.trash.ecommerce.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "vnpay") 
@Data 
public class VnPayConfig {
    private String tmnCode;     
    private String hashSecret;  
    private String url;        
    private String returnUrl; 
}