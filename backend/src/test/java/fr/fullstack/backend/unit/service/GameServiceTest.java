package fr.fullstack.backend.unit.service;

import fr.fullstack.backend.entity.Game;
import fr.fullstack.backend.entity.Genre;
import fr.fullstack.backend.repository.GameRepository;
import fr.fullstack.backend.repository.SteamKeyRepository;
import fr.fullstack.backend.service.GameService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
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
    private SteamKeyRepository steamKeyRepository;

    @InjectMocks
    private GameService gameService;

    private Pageable pageable;
    private Game game;

    @BeforeEach
    void setUp() {
        pageable = PageRequest.of(0, 10);
        game = new Game();
        game.setId(1L);
        game.setSteamAppId(12345);
        game.setName("Test Game");
        game.setSlug("test-game");
    }

    @Test
    void getCatalog_withNullSearch_passesEmptyStringToRepository() {
        Page<Game> page = new PageImpl<>(List.of(game));
        when(gameRepository.findWithFilters(eq(""), eq(null), any(Pageable.class))).thenReturn(page);

        Page<Game> result = gameService.getCatalog(null, null, pageable);

        assertThat(result.getContent()).hasSize(1);
        verify(gameRepository).findWithFilters("", null, pageable);
    }

    @Test
    void getCatalog_withBlankSearch_passesEmptyStringToRepository() {
        Page<Game> page = new PageImpl<>(List.of());
        when(gameRepository.findWithFilters(eq(""), eq(null), any(Pageable.class))).thenReturn(page);

        gameService.getCatalog("   ", null, pageable);

        verify(gameRepository).findWithFilters("", null, pageable);
    }

    @Test
    void getCatalog_withSearch_passesSearchToRepository() {
        Page<Game> page = new PageImpl<>(List.of(game));
        when(gameRepository.findWithFilters(eq("Portal"), eq(null), any(Pageable.class))).thenReturn(page);

        Page<Game> result = gameService.getCatalog("Portal", null, pageable);

        assertThat(result.getContent()).hasSize(1);
        verify(gameRepository).findWithFilters("Portal", null, pageable);
    }

    @Test
    void getCatalog_withGenreId_passesGenreIdToRepository() {
        Page<Game> page = new PageImpl<>(List.of(game));
        when(gameRepository.findWithFilters(eq(""), eq(5), any(Pageable.class))).thenReturn(page);

        gameService.getCatalog(null, 5, pageable);

        verify(gameRepository).findWithFilters("", 5, pageable);
    }

    @Test
    void getCatalog_withSearchAndGenre_passesBothToRepository() {
        Page<Game> page = new PageImpl<>(List.of());
        when(gameRepository.findWithFilters(eq("action"), eq(3), any(Pageable.class))).thenReturn(page);

        gameService.getCatalog("action", 3, pageable);

        verify(gameRepository).findWithFilters("action", 3, pageable);
    }

    @Test
    void getCatalog_emptyResults_returnsEmptyPage() {
        Page<Game> empty = new PageImpl<>(List.of());
        when(gameRepository.findWithFilters(any(), any(), any(Pageable.class))).thenReturn(empty);

        Page<Game> result = gameService.getCatalog(null, null, pageable);

        assertThat(result.getContent()).isEmpty();
        assertThat(result.getTotalElements()).isZero();
    }

    @Test
    void getGameDetails_existingId_returnsGame() {
        when(gameRepository.findById(1L)).thenReturn(Optional.of(game));

        Game result = gameService.getGameDetails(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Test Game");
    }

    @Test
    void getGameDetails_nonExistingId_throwsEntityNotFoundException() {
        when(gameRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> gameService.getGameDetails(999L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    void deleteGame_existingId_deletesGame() {
        when(gameRepository.existsById(1L)).thenReturn(true);

        gameService.deleteGame(1L);

        verify(gameRepository).deleteById(1L);
    }

    @Test
    void deleteGame_nonExistingId_throwsAndDoesNotDelete() {
        when(gameRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> gameService.deleteGame(999L))
                .isInstanceOf(EntityNotFoundException.class);
        verify(gameRepository, never()).deleteById(any());
    }

    @Test
    void getAvailableKeyCount_existingGame_returnsCount() {
        when(gameRepository.existsById(1L)).thenReturn(true);
        when(steamKeyRepository.countByGameId(1L)).thenReturn(7L);

        long count = gameService.getAvailableKeyCount(1L);

        assertThat(count).isEqualTo(7L);
    }

    @Test
    void getAvailableKeyCount_nonExistingGame_throwsEntityNotFound() {
        when(gameRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> gameService.getAvailableKeyCount(999L))
                .isInstanceOf(EntityNotFoundException.class);
        verify(steamKeyRepository, never()).countByGameId(any());
    }

    @Test
    void getAvailableKeyCount_returnsZeroWhenNoKeys() {
        when(gameRepository.existsById(1L)).thenReturn(true);
        when(steamKeyRepository.countByGameId(1L)).thenReturn(0L);

        assertThat(gameService.getAvailableKeyCount(1L)).isZero();
    }

    @Test
    void getAllGenres_returnsRepositoryResult() {
        Genre genre = new Genre();
        genre.setId(1);
        genre.setDescription("Action");
        when(gameRepository.findAllGenres()).thenReturn(List.of(genre));

        List<Genre> result = gameService.getAllGenres();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDescription()).isEqualTo("Action");
    }

    @Test
    void getAllGenres_emptyList_returnsEmptyList() {
        when(gameRepository.findAllGenres()).thenReturn(List.of());

        assertThat(gameService.getAllGenres()).isEmpty();
    }
}
