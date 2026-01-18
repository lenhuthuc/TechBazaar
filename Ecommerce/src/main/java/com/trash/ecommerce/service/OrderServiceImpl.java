package com.trash.ecommerce.service;

import java.math.BigDecimal;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.trash.ecommerce.dto.OrderSummaryDTO;
import com.trash.ecommerce.entity.*;
import com.trash.ecommerce.exception.*;
import com.trash.ecommerce.mapper.OrderMapper;
import com.trash.ecommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.trash.ecommerce.dto.CartItemDetailsResponseDTO;
import com.trash.ecommerce.dto.OrderMessageResponseDTO;
import com.trash.ecommerce.dto.OrderResponseDTO;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private PaymentMethodRepository paymentMethodRepository;
    @Autowired
    private PaymentService paymentService;
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private OrderMapper orderMapper;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private InvoiceService invoiceService;
    
    public OrderServiceImpl(UserRepository userRepository, OrderRepository orderRepository, PaymentService paymentService, InvoiceService invoiceService, PaymentMethodRepository paymentMethodRepository, CartRepository cartRepository, OrderMapper orderMapper, ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.cartRepository = cartRepository;
        this.paymentService = paymentService;
        this.invoiceService = invoiceService;
        this.orderMapper = orderMapper;
        this.productRepository = productRepository;
    }

    @Override
    public List<OrderSummaryDTO> getAllMyOrders(Long userId, String ipAddress) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        
        List<Order> orders = orderRepository.findByUserIdOrderByCreateAtDesc(userId);
        
        if (orders == null || orders.isEmpty()) {
            return List.of(); 
        }

        return orders.stream()
                .filter(order -> order != null) 
                .map(order -> {
                    try {
                        String url = null;
                        if (order.getStatus() != null && 
                            order.getStatus() == OrderStatus.PENDING_PAYMENT && 
                            order.getPaymentMethod() != null && 
                            order.getPaymentMethod().getId() != null &&
                            order.getPaymentMethod().getId() == 2L) {
                            url = paymentService.createPaymentUrl(order.getTotalPrice(), ".", order.getId(), ipAddress);
                        }
                        return orderMapper.toOrderSummaryDTO(order, url);
                    } catch (Exception e) {
                        return orderMapper.toOrderSummaryDTO(order, null);
                    }
                })
                .filter(dto -> dto != null) 
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponseDTO getOrderById(Long userId, Long orderId, String IpAddress) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getUser() == null || !order.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to view this order");
        }

        String paymentUrl = null;
        if (order.getPaymentMethod() != null && 
            order.getPaymentMethod().getId() != null &&
            order.getPaymentMethod().getId() == 2L && 
            order.getStatus() == OrderStatus.PENDING_PAYMENT) {
            paymentUrl = paymentService.createPaymentUrl(order.getTotalPrice(), ".", order.getId(), IpAddress);
        }

        return orderMapper.toOrderResponseDTO(order, paymentUrl);
    }

    @Override
    @Transactional
    public OrderResponseDTO createMyOrder(Long userId, Long paymentMethodId, String IpAddress) {


        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new FindingUserError("User not found"));

        Cart cart = user.getCart();
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new OrderValidException("Cart is empty");
        }

        PaymentMethod paymentMethod = paymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(() -> new PaymentException("Payment method not found"));

        String address = user.getAddress();
        if (address == null || address.trim().isEmpty()) {
            throw new OrderValidException("User address is required to create an order");
        }
        
        Order order = new Order();
        order.setCreateAt(new Date());
        order.setUser(user);
        order.setPaymentMethod(paymentMethod);
        order.setAddress(address);
        if (paymentMethod.getId() == 2L) {
            order.setStatus(OrderStatus.PENDING_PAYMENT);
        } else {
            order.setStatus(OrderStatus.PLACED);
        }

        BigDecimal totalPrice = BigDecimal.ZERO;
        Set<OrderItem> orderItems = new HashSet<>();
        Set<CartItemDetailsResponseDTO> responseItems = new HashSet<>();

        for (CartItem cartItem : cart.getItems()) {
            if (cartItem == null) continue;
            
            Product product = cartItem.getProduct();
            if (product == null) {
                throw new ProductQuantityValidation("Product not found in cart item");
            }
            
            Long quantityBuy = cartItem.getQuantity();
            if (quantityBuy == null || quantityBuy <= 0) {
                throw new ProductQuantityValidation("Invalid quantity in cart item");
            }

            if (product.getQuantity() == null || product.getQuantity() < quantityBuy) {
                throw new ProductQuantityValidation("Product " + product.getProductName() + " is out of stock!");
            }
            
            BigDecimal currentPrice = product.getPrice();
            BigDecimal lineAmount = currentPrice.multiply(BigDecimal.valueOf(quantityBuy));
            totalPrice = totalPrice.add(lineAmount);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(quantityBuy);
            orderItem.setPrice(currentPrice);
            orderItems.add(orderItem);


            CartItemDetailsResponseDTO dto = new CartItemDetailsResponseDTO();
            dto.setProductId(product.getId());
            dto.setProductName(product.getProductName());
            dto.setPrice(currentPrice);
            dto.setQuantity(quantityBuy);
            responseItems.add(dto);
        }

        order.setTotalPrice(totalPrice);
        order.setOrderItems(orderItems);

        orderRepository.save(order);

        if (paymentMethod.getId() == 1L) {
            for (OrderItem orderItem : orderItems) {
                if (orderItem == null || orderItem.getProduct() == null) {
                    continue;
                }
                Product product = orderItem.getProduct();
                Long quantity = orderItem.getQuantity();
                if (quantity == null || quantity <= 0) {
                    continue;
                }
                int updatedRows = productRepository.decreaseStock(product.getId(), quantity);
                if (updatedRows == 0) {
                    throw new ProductQuantityValidation("Hết hàng hoặc số lượng không đủ cho sản phẩm: " + product.getProductName());
                }
            }
           
            try {
                invoiceService.createInvoice(userId, order.getId(), paymentMethodId);
            } catch (Exception e) {
                System.out.println(e.getMessage());
                throw new RuntimeException("Hóa đơn bị lỗi");
            }
        }

        cartRepository.deleteCartItems(cart.getId());
        if (cart.getItems() != null) {
            cart.getItems().clear();
        }
        return new OrderResponseDTO(
                responseItems,
                totalPrice,
                order.getStatus(),
                address,
                (paymentMethodId == 1) ? null : paymentService.createPaymentUrl(totalPrice, ".", order.getId(), IpAddress)
        );
    }

    @Override
    @Transactional
    public OrderMessageResponseDTO deleteOrder(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                                        .orElseThrow(() -> new OrderExistsException("Order not found"));
        
        if (order.getUser() == null || !order.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to delete this order");
        }
        
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new OrderValidException("You can't delete this order ;-;");
        }
        orderRepository.delete(order);
        return new OrderMessageResponseDTO("Delete order successful");
    }
}
