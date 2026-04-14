package fr.fullstack.backend.dto;

import java.util.List;

public record OrderRequest(Integer userid, List<OrderRequestItem> games) {
    public record OrderRequestItem(Long gameIds, Integer quantity) {}
}
