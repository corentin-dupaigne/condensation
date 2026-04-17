package fr.fullstack.backend.unit.controller;

import fr.fullstack.backend.controller.GameController;
import fr.fullstack.backend.dto.GameDetailDto;
import fr.fullstack.backend.dto.GameSummaryDto;
import fr.fullstack.backend.dto.PageDto;
import fr.fullstack.backend.entity.Game;
import fr.fullstack.backend.entity.Genre;
import fr.fullstack.backend.mapper.CatalogMapper;
import fr.fullstack.backend.service.GameService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GameControllerTest {

    @Mock
    private GameService gameService;

    @Mock
    private CatalogMapper mapper;

    @InjectMocks
    private GameController gameController;

    private Game game;
    private GameSummaryDto summaryDto;

    @BeforeEach
    void setUp() {
        game = new Game();
        game.setId(1L);
        game.setName("Portal");
        summaryDto = new GameSummaryDto(1L, 400, "Portal", "portal", null,
                999, 0, 100, null, List.of());
    }

    @Test
    void getCatalog_returnsOkWithPageDto() {
        Page<Game> gamePage = new PageImpl<>(List.of(game));
        when(gameService.getCatalog(any(), any(), any(Pageable.class))).thenReturn(gamePage);
        when(mapper.toGameSummaryDto(game)).thenReturn(summaryDto);
        when(mapper.toPageDto(eq(gamePage), any())).thenReturn(new PageDto<>(List.of(summaryDto), 1, 1));

        ResponseEntity<PageDto<GameSummaryDto>> response = gameController.getCatalog(0, 20, null, null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().content()).hasSize(1);
        assertThat(response.getBody().totalElements()).isEqualTo(1);
    }

    @Test
    void getCatalog_forwardsSearchAndGenreParams() {
        Page<Game> empty = new PageImpl<>(List.of());
        when(gameService.getCatalog(eq("Portal"), eq(5), any(Pageable.class))).thenReturn(empty);
        when(mapper.toPageDto(eq(empty), any())).thenReturn(new PageDto<>(List.of(), 0, 0));

        gameController.getCatalog(0, 20, "Portal", 5);

        verify(gameService).getCatalog(eq("Portal"), eq(5), any(Pageable.class));
    }

    @Test
    void getGameDetails_returnsOkWithDto() {
        GameDetailDto detail = new GameDetailDto(1L, 400, "Portal", "portal", null,
                999, 0, 100, null, List.of(), null, null, null, (short) 0,
                null, (short) 90, "EUR", 999, null, null, null, null,
                List.of(), List.of(), List.of(), List.of());
        when(gameService.getGameDetails(1L)).thenReturn(game);
        when(mapper.toGameDetailDto(game)).thenReturn(detail);

        ResponseEntity<GameDetailDto> response = gameController.getGameDetails(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().id()).isEqualTo(1L);
        assertThat(response.getBody().name()).isEqualTo("Portal");
    }

    @Test
    void deleteGame_returnsNoContentAndDelegates() {
        ResponseEntity<Void> response = gameController.deleteGame(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(response.getBody()).isNull();
        verify(gameService).deleteGame(1L);
    }

    @Test
    void getKeyCounts_returnsOkWithMap() {
        when(gameService.getAvailableKeyCount(1L)).thenReturn(7L);

        ResponseEntity<Map<String, Long>> response = gameController.getKeyCounts(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("key_counts", 7L);
    }

    @Test
    void getGenres_returnsOkWithGenreList() {
        Genre g = new Genre();
        g.setId(1);
        g.setDescription("Action");
        when(gameService.getAllGenres()).thenReturn(List.of(g));

        var response = gameController.getGenres();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody().get(0).description()).isEqualTo("Action");
    }

    @Test
    void getGenres_emptyList_returnsOkWithEmptyList() {
        when(gameService.getAllGenres()).thenReturn(List.of());

        var response = gameController.getGenres();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEmpty();
    }
}
