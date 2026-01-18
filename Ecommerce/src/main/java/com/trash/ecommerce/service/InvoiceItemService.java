package com.trash.ecommerce.service;


import com.trash.ecommerce.dto.InvoiceItemResponse;
import com.trash.ecommerce.entity.InvoiceItem;
import com.trash.ecommerce.entity.InvoiceItemId;
import com.trash.ecommerce.entity.OrderItem;

import java.util.List;

public interface InvoiceItemService {
    public InvoiceItem createFromOrderItem(OrderItem orderItem);
    public InvoiceItemResponse getInvoiceItem(InvoiceItemId invoiceItemId);
    public List<InvoiceItemResponse> getItemsByInvoice(Long invoiceId);
}
