package fr.fullstack.backend.dto;

public record FeatureDataDto(
        PageDto<GameSummaryDto> topseller,
        PageDto<GameSummaryDto> newRelease,
        LowDealsDto lowDeals,
        PageDto<GameSummaryDto> upcoming
) {
    public record LowDealsDto(
            PageDto<GameSummaryDto> under5,
            PageDto<GameSummaryDto> under10,
            PageDto<GameSummaryDto> under20
    ) {}
}