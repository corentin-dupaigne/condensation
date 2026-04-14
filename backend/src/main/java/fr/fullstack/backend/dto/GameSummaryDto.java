package fr.fullstack.backend.dto;

import java.time.LocalDate;
import java.util.List;

public record GameSummaryDto(
        Long id,
        Integer steamAppId,
        String name,
        String slug,
        String headerImage,
        Integer priceFinal,
        Integer reductionPercentage,
        Integer recommendationsTotal,
        LocalDate releaseDate,
        List<GenreDto> genres
) {}