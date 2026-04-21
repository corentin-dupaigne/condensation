package fr.fullstack.backend.unit.dto;

import fr.fullstack.backend.dto.*;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class DtoRecordsTest {

    @Test
    void balanceRequest_holdsValues() {
        BalanceRequest req = new BalanceRequest(250);

        assertThat(req.amount()).isEqualTo(250);
    }

    @Test
    void balanceRequest_supportsEqualsAndHashcode() {
        BalanceRequest a = new BalanceRequest(250);
        BalanceRequest b = new BalanceRequest(250);

        assertThat(a).isEqualTo(b);
        assertThat(a.hashCode()).isEqualTo(b.hashCode());
    }

    @Test
    void orderRequest_holdsValuesAndNestedItems() {
        OrderRequest.OrderRequestItem item = new OrderRequest.OrderRequestItem(10L, 2);
        OrderRequest req = new OrderRequest(List.of(item));

        assertThat(req.games()).hasSize(1);
        assertThat(req.games().get(0).gameIds()).isEqualTo(10L);
        assertThat(req.games().get(0).quantity()).isEqualTo(2);
    }

    @Test
    void genreDto_holdsValues() {
        GenreDto g = new GenreDto(1, "Action");

        assertThat(g.id()).isEqualTo(1);
        assertThat(g.description()).isEqualTo("Action");
    }

    @Test
    void categoryDto_holdsValues() {
        CategoryDto c = new CategoryDto(2, "Multi-player");

        assertThat(c.id()).isEqualTo(2);
        assertThat(c.description()).isEqualTo("Multi-player");
    }

    @Test
    void companyDto_holdsValues() {
        CompanyDto c = new CompanyDto(5, "Valve");

        assertThat(c.id()).isEqualTo(5);
        assertThat(c.name()).isEqualTo("Valve");
    }

    @Test
    void gameCompanyDto_holdsCompanyAndRole() {
        CompanyDto company = new CompanyDto(1, "Valve");
        GameCompanyDto gc = new GameCompanyDto(company, "developer");

        assertThat(gc.company()).isSameAs(company);
        assertThat(gc.role()).isEqualTo("developer");
    }

    @Test
    void pageDto_holdsContentAndMetadata() {
        PageDto<String> page = new PageDto<>(List.of("a", "b"), 2, 1);

        assertThat(page.content()).containsExactly("a", "b");
        assertThat(page.totalElements()).isEqualTo(2);
        assertThat(page.totalPages()).isEqualTo(1);
    }

    @Test
    void screenshotDto_holdsValues() {
        ScreenshotDto s = new ScreenshotDto(1L, 100, "thumb.png", "full.png", (short) 0);

        assertThat(s.id()).isEqualTo(1L);
        assertThat(s.steamId()).isEqualTo(100);
        assertThat(s.position()).isZero();
    }

    @Test
    void movieDto_holdsValues() {
        MovieDto m = new MovieDto(1L, 200, "Trailer", "thumb", "av1", "h264", "hls", true, (short) 1);

        assertThat(m.name()).isEqualTo("Trailer");
        assertThat(m.highlight()).isTrue();
        assertThat(m.position()).isEqualTo((short) 1);
    }

    @Test
    void orderDto_holdsValuesAndGameInfo() {
        OrderDto.GameInfo info = new OrderDto.GameInfo("Portal", "header.png", List.of("Puzzle"));
        OrderDto o = new OrderDto(1, 7, 10L, "KEY-XXX", info);

        assertThat(o.id()).isEqualTo(1);
        assertThat(o.userId()).isEqualTo(7);
        assertThat(o.gamesId()).isEqualTo(10L);
        assertThat(o.key()).isEqualTo("KEY-XXX");
        assertThat(o.game().name()).isEqualTo("Portal");
        assertThat(o.game().genres()).containsExactly("Puzzle");
    }

    @Test
    void featureDataDto_exposesAllFields() {
        PageDto<GameSummaryDto> empty = new PageDto<>(List.of(), 0, 0);
        FeatureDataDto.LowDealsDto low = new FeatureDataDto.LowDealsDto(empty, empty, empty);
        FeatureDataDto data = new FeatureDataDto(empty, empty, low, empty);

        assertThat(data.topseller()).isSameAs(empty);
        assertThat(data.newRelease()).isSameAs(empty);
        assertThat(data.upcoming()).isSameAs(empty);
        assertThat(data.lowDeals().under5()).isSameAs(empty);
        assertThat(data.lowDeals().under10()).isSameAs(empty);
        assertThat(data.lowDeals().under20()).isSameAs(empty);
    }
}
