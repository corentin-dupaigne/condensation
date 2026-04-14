package fr.fullstack.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import tools.jackson.databind.JsonNode;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record GameDetailDto(
        Long id,
        Integer steamAppId,
        String name,
        String slug,
        String headerImage,
        Integer priceFinal,
        Integer reductionPercentage,
        Integer recommendationsTotal,
        LocalDate releaseDate,
        List<GenreDto> genres,
        String detailedDescription,
        String aboutTheGame,
        String supportedLanguages,
        Short requiredAge,
        String releaseDateRaw,
        Short metacriticScore,
        String currency,
        Integer priceInitial,
        JsonNode pcRequirements,
        JsonNode macRequirements,
        JsonNode linuxRequirements,
        OffsetDateTime updatedAt,
        List<GameCompanyDto> companies,
        List<CategoryDto> categories,
        List<ScreenshotDto> screenshots,
        List<MovieDto> movies
) {}
