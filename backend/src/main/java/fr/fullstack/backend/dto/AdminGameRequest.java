package fr.fullstack.backend.dto;

public record AdminGameRequest(
        Integer steamAppId,
        String name,
        String slug,
        String headerImage,
        Integer priceFinal,
        Integer reductionPercentage,
        String releaseDate,
        String releaseDateRaw,
        Short requiredAge,
        Short metacriticScore,
        Integer recommendationsTotal,
        String currency,
        Boolean platformWindows,
        Boolean platformMac,
        Boolean platformLinux,
        String detailedDescription,
        String aboutTheGame,
        String supportedLanguages,
        String pcRequirements,
        String macRequirements,
        String linuxRequirements
) {}
