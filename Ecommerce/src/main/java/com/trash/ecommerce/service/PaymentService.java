package com.trash.ecommerce.service;

import java.math.BigDecimal;
import java.util.Map;

import com.trash.ecommerce.dto.PaymentMethodMessageResponse;
import jakarta.servlet.http.HttpServletRequest;

public interface PaymentService {
    public PaymentMethodMessageResponse addPaymentMethod(Long userId, String name);
    public String createPaymentUrl(BigDecimal total_price, String orderInfo, Long orderId, String ipAddress);
    public Map<String, String> handleProcedurePayment(HttpServletRequest request);
    public Map<String, String> hashFields(HttpServletRequest request);
    public PaymentMethodMessageResponse handleProcedureUserInterface(HttpServletRequest request);
}
