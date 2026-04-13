package fr.fullstack.backend.mapper;

import fr.fullstack.backend.dto.*;
import fr.fullstack.backend.entity.Game;
import fr.fullstack.backend.entity.GameCompany;
import fr.fullstack.backend.entity.Genre;
import fr.fullstack.backend.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.data.domain.Page;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring")
public interface CatalogMapper {

    ObjectMapper jsonMapper = new ObjectMapper();

    @Mapping(target = "priceFinal", expression = "java(calculatePriceFinal(game.getPriceInitial(), game.getReductionPercentage()))")
    GameSummaryDto toGameSummaryDto(Game game);

    @Mapping(target = "priceFinal", expression = "java(calculatePriceFinal(game.getPriceInitial(), game.getReductionPercentage()))")
    @Mapping(target = "pcRequirements", source = "pcRequirements", qualifiedByName = "stringToJsonNode")
    @Mapping(target = "macRequirements", source = "macRequirements", qualifiedByName = "stringToJsonNode")
    @Mapping(target = "linuxRequirements", source = "linuxRequirements", qualifiedByName = "stringToJsonNode")
    @Mapping(target = "companies", source = "gameCompanies")
    GameDetailDto toGameDetailDto(Game game);

    @Mapping(target = "company", source = "company")
    @Mapping(target = "role", source = "role")
    GameCompanyDto toGameCompanyDto(GameCompany gameCompany);

    @Mapping(target = "gamesId", source = "game.id")
    @Mapping(target = "userId", source = "userId")
    @Mapping(target = "game", source = "game", qualifiedByName = "gameToGameInfo")
    OrderDto toOrderDto(Order order);

    default OrderDto.GameInfo toGameInfo(Game game) {
        if (game == null) return null;
        List<String> genreNames = game.getGenres() != null
                ? game.getGenres().stream().map(Genre::getDescription).toList()
                : List.of();
        return new OrderDto.GameInfo(game.getName(), game.getHeaderImage(), genreNames);
    }

    @Named("gameToGameInfo")
    default OrderDto.GameInfo gameToGameInfo(Game game) {
        return toGameInfo(game);
    }

    List<OrderDto> toOrderDtoList(List<Order> orders);

    default Integer calculatePriceFinal(Integer priceInitial, Integer reduction) {
        if (priceInitial == null) return null;
        if (reduction == null || reduction <= 0) return priceInitial;
        return priceInitial * (100 - reduction) / 100;
    }

    default <T> PageDto<T> toPageDto(Page<?> page, List<T> content) {
        return new PageDto<>(content, page.getTotalElements(), page.getTotalPages());
    }

    @Named("stringToJsonNode")
    default JsonNode stringToJsonNode(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return jsonMapper.readTree(json);
        } catch (JacksonException e) {
            return null;
        }
    }
}