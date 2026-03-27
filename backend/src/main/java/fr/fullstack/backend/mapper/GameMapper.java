package fr.fullstack.backend.mapper;

import fr.fullstack.backend.dto.GameDetail;
import fr.fullstack.backend.dto.GameSummary;
import fr.fullstack.backend.entity.Game;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface GameMapper {

    GameSummary toSummary(Game game);

    @Mapping(target = "companies", source = "gameCompanies")
    GameDetail toDetail(Game game);

}
