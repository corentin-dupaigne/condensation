package fr.fullstack.backend.unit.mapper;

import fr.fullstack.backend.dto.OrderDto;
import fr.fullstack.backend.dto.PageDto;
import fr.fullstack.backend.entity.Game;
import fr.fullstack.backend.entity.Genre;
import fr.fullstack.backend.mapper.CatalogMapper;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import tools.jackson.databind.JsonNode;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class CatalogMapperTest {

    private final CatalogMapper mapper = new CatalogMapper() {
        @Override
        public fr.fullstack.backend.dto.GameSummaryDto toGameSummaryDto(Game game) {
            return null;
        }

        @Override
        public fr.fullstack.backend.dto.GameDetailDto toGameDetailDto(Game game) {
            return null;
        }

        @Override
        public fr.fullstack.backend.dto.GameCompanyDto toGameCompanyDto(fr.fullstack.backend.entity.GameCompany gameCompany) {
            return null;
        }

        @Override
        public OrderDto toOrderDto(fr.fullstack.backend.entity.Order order) {
            return null;
        }

        @Override
        public List<OrderDto> toOrderDtoList(List<fr.fullstack.backend.entity.Order> orders) {
            return List.of();
        }
    };

    // --- calculatePriceFinal ---

    @Test
    void calculatePriceFinal_nullPrice_returnsNull() {
        assertThat(mapper.calculatePriceFinal(null, 10)).isNull();
        assertThat(mapper.calculatePriceFinal(null, null)).isNull();
    }

    @Test
    void calculatePriceFinal_nullReduction_returnsInitial() {
        assertThat(mapper.calculatePriceFinal(2000, null)).isEqualTo(2000);
    }

    @Test
    void calculatePriceFinal_zeroReduction_returnsInitial() {
        assertThat(mapper.calculatePriceFinal(2000, 0)).isEqualTo(2000);
    }

    @Test
    void calculatePriceFinal_negativeReduction_returnsInitial() {
        assertThat(mapper.calculatePriceFinal(2000, -10)).isEqualTo(2000);
    }

    @Test
    void calculatePriceFinal_positiveReduction_appliesPercentage() {
        assertThat(mapper.calculatePriceFinal(2000, 50)).isEqualTo(1000);
        assertThat(mapper.calculatePriceFinal(2000, 25)).isEqualTo(1500);
        assertThat(mapper.calculatePriceFinal(1000, 10)).isEqualTo(900);
    }

    @Test
    void calculatePriceFinal_fullReduction_returnsZero() {
        assertThat(mapper.calculatePriceFinal(2000, 100)).isZero();
    }

    // --- toPageDto ---

    @Test
    void toPageDto_copiesContentAndPageMetadata() {
        Page<Game> page = new PageImpl<>(List.of(new Game()), PageRequest.of(0, 10), 42);
        List<String> content = List.of("a", "b");

        PageDto<String> dto = mapper.toPageDto(page, content);

        assertThat(dto.content()).isEqualTo(content);
        assertThat(dto.totalElements()).isEqualTo(42);
        assertThat(dto.totalPages()).isEqualTo(5);
    }

    @Test
    void toPageDto_emptyPage_returnsEmptyDto() {
        Page<Game> page = new PageImpl<>(List.of(), PageRequest.of(0, 10), 0);

        PageDto<Object> dto = mapper.toPageDto(page, List.of());

        assertThat(dto.content()).isEmpty();
        assertThat(dto.totalElements()).isZero();
        assertThat(dto.totalPages()).isZero();
    }

    // --- stringToJsonNode ---

    @Test
    void stringToJsonNode_null_returnsNull() {
        assertThat(mapper.stringToJsonNode(null)).isNull();
    }

    @Test
    void stringToJsonNode_blank_returnsNull() {
        assertThat(mapper.stringToJsonNode("")).isNull();
        assertThat(mapper.stringToJsonNode("   ")).isNull();
    }

    @Test
    void stringToJsonNode_invalidJson_returnsNull() {
        assertThat(mapper.stringToJsonNode("{not valid")).isNull();
    }

    @Test
    void stringToJsonNode_validJson_returnsNode() {
        JsonNode node = mapper.stringToJsonNode("{\"minimum\":\"Windows 10\"}");
        assertThat(node).isNotNull();
        assertThat(node.get("minimum").asString()).isEqualTo("Windows 10");
    }

    // --- toGameInfo / gameToGameInfo ---

    @Test
    void toGameInfo_null_returnsNull() {
        assertThat(mapper.toGameInfo(null)).isNull();
        assertThat(mapper.gameToGameInfo(null)).isNull();
    }

    @Test
    void toGameInfo_withGenres_includesGenreNames() {
        Game g = new Game();
        g.setName("Portal");
        g.setHeaderImage("header.png");
        Genre a = new Genre();
        a.setDescription("Puzzle");
        Genre b = new Genre();
        b.setDescription("Platformer");
        g.setGenres(Set.of(a, b));

        OrderDto.GameInfo info = mapper.toGameInfo(g);

        assertThat(info.name()).isEqualTo("Portal");
        assertThat(info.headerImage()).isEqualTo("header.png");
        assertThat(info.genres()).containsExactlyInAnyOrder("Puzzle", "Platformer");
    }

    @Test
    void toGameInfo_nullGenres_usesEmptyList() {
        Game g = new Game();
        g.setName("Game");
        g.setHeaderImage("h.png");

        OrderDto.GameInfo info = mapper.toGameInfo(g);

        assertThat(info.genres()).isEmpty();
    }
}
