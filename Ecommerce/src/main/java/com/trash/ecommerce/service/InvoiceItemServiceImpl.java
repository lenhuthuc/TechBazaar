package com.trash.ecommerce.service;

import com.trash.ecommerce.dto.InvoiceItemResponse;
import com.trash.ecommerce.entity.*;
import com.trash.ecommerce.exception.OrderExistsException;
import com.trash.ecommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class InvoiceItemServiceImpl implements InvoiceItemService {
    @Autowired
    private InvoiceItemRepository invoiceItemRepository;
    @Override
    public InvoiceItem createFromOrderItem(OrderItem orderItem) {

        if (orderItem == null) {
            throw new OrderExistsException("Order item is null");
        }

        if (orderItem.getProduct() == null) {
            throw new OrderExistsException("Product not found in order item");
        }

        InvoiceItem invoiceItem = new InvoiceItem();

        invoiceItem.setProduct(orderItem.getProduct());
        invoiceItem.setPrice(orderItem.getPrice());
        invoiceItem.setQuantity(orderItem.getQuantity());
        invoiceItem.setTotal(
                orderItem.getPrice().multiply(
                        BigDecimal.valueOf(orderItem.getQuantity())
                )
        );

        return invoiceItem;
    }

    @Override
    public InvoiceItemResponse getInvoiceItem(InvoiceItemId invoiceItemId) {
        InvoiceItem invoiceItem = invoiceItemRepository.findById(invoiceItemId)
                .orElseThrow(() -> new RuntimeException("InvoiceItem not found"));

        return new InvoiceItemResponse(
                invoiceItem.getId().getInvoiceId(),
                invoiceItem.getId().getProductId(),
                invoiceItem.getQuantity(),
                invoiceItem.getPrice(),
                invoiceItem.getTotal()
        );
    }

    @Override
    public List<InvoiceItemResponse> getItemsByInvoice(Long invoiceId) {
        List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(invoiceId);

        return items.stream()
                .map(item -> new InvoiceItemResponse(
                        item.getId().getInvoiceId(),
                        item.getId().getProductId(),
                        item.getQuantity(),
                        item.getPrice(),
                        item.getTotal()
                ))
                .toList();
    }

}
