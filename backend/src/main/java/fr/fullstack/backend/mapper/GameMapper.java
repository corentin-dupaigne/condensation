package fr.fullstack.backend.mapper;

import fr.fullstack.backend.dto.GameDetail;
import fr.fullstack.backend.dto.GameSummaryDto;
import fr.fullstack.backend.entity.Game;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.OffsetDateTime;
import java.time.ZonedDateTime;

@Mapper(componentModel = "spring")
public interface GameMapper {

    GameSummaryDto toSummary(Game game);

    @Mapping(target = "companies", source = "gameCompanies")
    GameDetail toDetail(Game game);

    default ZonedDateTime map(OffsetDateTime value) {
        if (value == null) {
            return null;
        }
        return value.toZonedDateTime();
    }

}
