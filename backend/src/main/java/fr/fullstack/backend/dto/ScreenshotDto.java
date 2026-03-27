package fr.fullstack.backend.dto;

public record ScreenshotDto(Long id, Integer steamId, String pathThumbnail, String pathFull, Short position) {}