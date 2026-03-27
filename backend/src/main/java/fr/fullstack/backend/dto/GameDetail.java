package fr.fullstack.backend.dto;

import com.fasterxml.jackson.annotation.JsonRawValue;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

public record GameDetail(
        Long id,
        Integer steamAppId,
        String name,
        String slug,
        String headerImage,
        Integer priceFinal,
        Integer discountPercent,
        Boolean platformWindows,
        Boolean platformMac,
        Boolean platformLinux,
        String detailedDescription,
        String aboutTheGame,
        String supportedLanguages,
        Short requiredAge,
        LocalDate releaseDate,
        String releaseDateRaw,
        Short metacriticScore,
        Integer recommendationsTotal,
        String currency,
        Integer priceInitial,
        Integer reductionPercentage,
        String steamKey,
        @JsonRawValue
        String pcRequirements,
        @JsonRawValue
        String macRequirements,
        @JsonRawValue
        String linuxRequirements,
        ZonedDateTime crawledAt,
        ZonedDateTime updatedAt,
        List<GameCompanyDto> companies,
        List<GenreDto> genres,
        List<CategoryDto> categories,
        List<ScreenshotDto> screenshots,
        List<MovieDto> movies
) {}
