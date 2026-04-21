package fr.fullstack.backend.dto;

public record AdminOrderDto(
        Integer id,
        Integer userId,
        Long gamesId,
        String key
) {}
