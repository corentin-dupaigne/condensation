package fr.fullstack.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import tools.jackson.databind.JsonNode;

import java.time.LocalDate;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AdminGameDetailDto(
        Long id,
        Integer steamAppId,
        String name,
        String slug,
        String headerImage,
        Integer priceFinal,
        Integer reductionPercentage,
        Integer recommendationsTotal,
        LocalDate releaseDate,
        String releaseDateRaw,
        Short requiredAge,
        Short metacriticScore,
        String currency,
        Boolean platformWindows,
        Boolean platformMac,
        Boolean platformLinux,
        String detailedDescription,
        String aboutTheGame,
        String supportedLanguages,
        JsonNode pcRequirements,
        JsonNode macRequirements,
        JsonNode linuxRequirements
) {}
