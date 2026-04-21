package fr.fullstack.backend.dto;

public record AdminOrderRequest(
        Integer userId,
        Long gamesId,
        String key
) {}
