package fr.fullstack.backend.integration;

import fr.fullstack.backend.entity.Game;
import fr.fullstack.backend.repository.GameRepository;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MediaType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class GameControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private GameRepository gameRepository;

    private Game testGame;

    @BeforeEach
    void setUp() {
        gameRepository.deleteAll();

        Game game = Game.builder()
                .steamAppId(12345)
                .name("Super Jeu Test")
                .slug("super-jeu-test")
                .priceFinal(1999)
                .pcRequirements("{\"os\":\"Windows 10\", \"ram\":\"8GB\"}")
                .build();

        testGame = gameRepository.save(game);
    }

    @Test
    void testGetAllGames() throws Exception {
        mockMvc.perform(get("/api/games")
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].name", is("Super Jeu Test")))
                .andExpect(jsonPath("$.content[0].priceFinal", is(1999)));
    }

    @Test
    void testGetGameById_Success() throws Exception {
        mockMvc.perform(get("/api/games/" + testGame.getId())
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(testGame.getId().intValue())))
                .andExpect(jsonPath("$.steamAppId", is(12345)))
                .andExpect(jsonPath("$.name", is("Super Jeu Test")))
                .andExpect(jsonPath("$.pcRequirements.os", is("Windows 10")))
                .andExpect(jsonPath("$.pcRequirements.ram", is("8GB")));
    }

    @Test
    void testGetGameById_NotFound() throws Exception {
        mockMvc.perform(get("/api/games/9999999")
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("Not Found")))
                .andExpect(jsonPath("$.message", is("Le jeu avec l'ID 9999999 est introuvable.")));
    }
}
