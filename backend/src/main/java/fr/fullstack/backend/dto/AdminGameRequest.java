package fr.fullstack.backend.dto;

public record AdminGameRequest(
        Integer steamAppId,
        String name,
        String slug,
        String headerImage,
        Integer priceFinal,
        Integer reductionPercentage,
        String releaseDate
) {}
