package fr.fullstack.backend.unit.service;

import fr.fullstack.backend.dto.GameDetail;
import fr.fullstack.backend.dto.GameSummary;
import fr.fullstack.backend.entity.Game;
import fr.fullstack.backend.mapper.GameMapper;
import fr.fullstack.backend.repository.GameRepository;
import fr.fullstack.backend.service.GameService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GameServiceTest {

    @Mock
    private GameRepository gameRepository;

    @Mock
    private GameMapper gameMapper;

    @InjectMocks
    private GameService gameService;

    private final Pageable pageable = PageRequest.of(0, 10);

    // --- getAllGames ---

    @Test
    void getAllGames_withNoFilters_returnsAllGames() {
        Game game = Game.builder().id(1L).name("Test Game").build();
        GameSummary summary = new GameSummary(1L, 100, "Test Game", "test-game", null, 999, 0, true, false, false);
        Page<Game> gamePage = new PageImpl<>(List.of(game));

        when(gameRepository.findAll(pageable)).thenReturn(gamePage);
        when(gameMapper.toSummary(game)).thenReturn(summary);

        Page<GameSummary> result = gameService.getAllGames(null, null, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).name()).isEqualTo("Test Game");
        verify(gameRepository).findAll(pageable);
        verify(gameRepository, never()).searchByText(any(), any());
        verify(gameRepository, never()).findByGenreId(any(), any());
    }

    @Test
    void getAllGames_withSearch_usesSearchByText() {
        Game game = Game.builder().id(1L).name("Portal").build();
        GameSummary summary = new GameSummary(1L, 400, "Portal", "portal", null, 999, 0, true, false, false);
        Page<Game> gamePage = new PageImpl<>(List.of(game));

        when(gameRepository.searchByText("Portal", pageable)).thenReturn(gamePage);
        when(gameMapper.toSummary(game)).thenReturn(summary);

        Page<GameSummary> result = gameService.getAllGames("Portal", null, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).name()).isEqualTo("Portal");
        verify(gameRepository).searchByText("Portal", pageable);
        verify(gameRepository, never()).findAll(any(Pageable.class));
    }

    @Test
    void getAllGames_withBlankSearch_fallsBackToFindAll() {
        Page<Game> gamePage = new PageImpl<>(List.of());

        when(gameRepository.findAll(pageable)).thenReturn(gamePage);

        gameService.getAllGames("   ", null, pageable);

        verify(gameRepository).findAll(pageable);
        verify(gameRepository, never()).searchByText(any(), any());
    }

    @Test
    void getAllGames_withGenreId_usesGenreFilter() {
        Game game = Game.builder().id(1L).name("RPG Game").build();
        GameSummary summary = new GameSummary(1L, 200, "RPG Game", "rpg-game", null, 1999, 0, true, false, false);
        Page<Game> gamePage = new PageImpl<>(List.of(game));

        when(gameRepository.findByGenreId(5, pageable)).thenReturn(gamePage);
        when(gameMapper.toSummary(game)).thenReturn(summary);

        Page<GameSummary> result = gameService.getAllGames(null, 5, pageable);

        assertThat(result.getContent()).hasSize(1);
        verify(gameRepository).findByGenreId(5, pageable);
        verify(gameRepository, never()).findAll(any(Pageable.class));
    }

    @Test
    void getAllGames_searchTakesPriorityOverGenreId() {
        Page<Game> gamePage = new PageImpl<>(List.of());

        when(gameRepository.searchByText(eq("query"), any())).thenReturn(gamePage);

        gameService.getAllGames("query", 5, pageable);

        verify(gameRepository).searchByText("query", pageable);
        verify(gameRepository, never()).findByGenreId(any(), any());
    }

    @Test
    void getAllGames_emptyResult_returnsEmptyPage() {
        Page<Game> emptyPage = new PageImpl<>(List.of());

        when(gameRepository.findAll(pageable)).thenReturn(emptyPage);

        Page<GameSummary> result = gameService.getAllGames(null, null, pageable);

        assertThat(result.getContent()).isEmpty();
        assertThat(result.getTotalElements()).isZero();
    }

    // --- getGameById ---

    @Test
    void getGameById_existingId_returnsGameDetail() {
        Game game = Game.builder().id(1L).name("Test Game").steamAppId(12345).build();
        GameDetail detail = new GameDetail(1L, 12345, "Test Game", "test-game", null, 999, 0,
                true, false, false, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null, null,
                List.of(), List.of(), List.of(), List.of(), List.of());

        when(gameRepository.findById(1L)).thenReturn(Optional.of(game));
        when(gameMapper.toDetail(game)).thenReturn(detail);

        GameDetail result = gameService.getGameById(1L);

        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.name()).isEqualTo("Test Game");
        verify(gameRepository).findById(1L);
    }

    @Test
    void getGameById_nonExistingId_throwsEntityNotFoundException() {
        when(gameRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> gameService.getGameById(999L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessage("Le jeu avec l'ID 999 est introuvable.");
    }

    // --- deleteGame ---

    @Test
    void deleteGame_existingId_deletesSuccessfully() {
        when(gameRepository.existsById(1L)).thenReturn(true);

        gameService.deleteGame(1L);

        verify(gameRepository).deleteById(1L);
    }

    @Test
    void deleteGame_nonExistingId_throwsEntityNotFoundException() {
        when(gameRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> gameService.deleteGame(999L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessage("Le jeu avec l'ID 999 est introuvable.");

        verify(gameRepository, never()).deleteById(any());
    }
}
