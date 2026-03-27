package fr.fullstack.backend.unit.controller;

import fr.fullstack.backend.controller.GameController;
import fr.fullstack.backend.dto.GameDetail;
import fr.fullstack.backend.dto.GameSummary;
import fr.fullstack.backend.service.GameService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GameController.class)
class GameControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GameService gameService;

    @Test
    void getAllGames_returnsOkWithGamesList() throws Exception {
        GameSummary summary = new GameSummary(1L, 100, "Test Game", "test-game", "img.png", 999, 0, true, false, false);
        when(gameService.getAllGames(any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(summary)));

        mockMvc.perform(get("/api/games"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].name", is("Test Game")))
                .andExpect(jsonPath("$.content[0].steamAppId", is(100)))
                .andExpect(jsonPath("$.content[0].priceFinal", is(999)));
    }

    @Test
    void getAllGames_passesSearchParam() throws Exception {
        when(gameService.getAllGames(eq("Portal"), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/api/games").param("search", "Portal"))
                .andExpect(status().isOk());

        verify(gameService).getAllGames(eq("Portal"), any(), any(Pageable.class));
    }

    @Test
    void getAllGames_passesGenreIdParam() throws Exception {
        when(gameService.getAllGames(any(), eq(5), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/api/games").param("genreId", "5"))
                .andExpect(status().isOk());

        verify(gameService).getAllGames(any(), eq(5), any(Pageable.class));
    }

    @Test
    void getAllGames_emptyList_returnsOkWithEmptyContent() throws Exception {
        when(gameService.getAllGames(any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/api/games"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)))
                .andExpect(jsonPath("$.totalElements", is(0)));
    }

    @Test
    void getGameById_existingId_returnsOkWithGameDetail() throws Exception {
        GameDetail detail = new GameDetail(1L, 12345, "Super Game", "super-game", "header.png", 1999, 0,
                true, false, false, "Description", "About", "English", (short) 0, null, null,
                (short) 85, 1000, "EUR", 2999, 33, null, null, null, null, null, null,
                List.of(), List.of(), List.of(), List.of(), List.of());

        when(gameService.getGameById(1L)).thenReturn(detail);

        mockMvc.perform(get("/api/games/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("Super Game")))
                .andExpect(jsonPath("$.steamAppId", is(12345)))
                .andExpect(jsonPath("$.metacriticScore", is(85)));
    }

    @Test
    void getGameById_nonExistingId_returns404() throws Exception {
        when(gameService.getGameById(999L))
                .thenThrow(new EntityNotFoundException("Le jeu avec l'ID 999 est introuvable."));

        mockMvc.perform(get("/api/games/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteGame_existingId_returns204() throws Exception {
        doNothing().when(gameService).deleteGame(1L);

        mockMvc.perform(delete("/api/games/1"))
                .andExpect(status().isNoContent());

        verify(gameService).deleteGame(1L);
    }

    @Test
    void deleteGame_nonExistingId_returns404() throws Exception {
        doThrow(new EntityNotFoundException("Le jeu avec l'ID 999 est introuvable."))
                .when(gameService).deleteGame(999L);

        mockMvc.perform(delete("/api/games/999"))
                .andExpect(status().isNotFound());
    }
}
