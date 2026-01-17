package com.trash.ecommerce.dto;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequestDTO {
    @Email(message = "Email không hợp lệ")
    private String email;
    private String address;
}
