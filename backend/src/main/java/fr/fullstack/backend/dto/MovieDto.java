package fr.fullstack.backend.dto;

public record MovieDto(Long id, Integer steamId, String name, String thumbnail, String dashAv1, String dashH264, String hlsH264, Boolean highlight, Short position) {}
