package fr.fullstack.backend.dto;

public record GameSummary(
        Long id,
        Integer steamAppId,
        String name,
        String slug,
        String headerImage,
        Integer priceFinal,
        Integer discountPercent,
        Boolean platformWindows,
        Boolean platformMac,
        Boolean platformLinux
) {}