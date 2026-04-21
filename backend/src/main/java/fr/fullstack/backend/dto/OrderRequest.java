package fr.fullstack.backend.dto;

import java.util.List;

public record OrderRequest(List<OrderRequestItem> games) {
    public record OrderRequestItem(Long gameIds, Integer quantity) {}
}
