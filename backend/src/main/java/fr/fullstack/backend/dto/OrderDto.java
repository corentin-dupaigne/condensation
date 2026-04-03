package fr.fullstack.backend.dto;

public record OrderDto(Integer id, Integer userId, Long gamesId, String key) {}
