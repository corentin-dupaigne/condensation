package fr.fullstack.backend.dto;

public record OrderDto(Integer id, Integer userId, Long gamesId, String key, GameInfo game) {

    public record GameInfo(String name, String headerImage, java.util.List<String> genres) {}
}
