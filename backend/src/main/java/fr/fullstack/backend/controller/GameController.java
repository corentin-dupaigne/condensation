package fr.fullstack.backend.controller;

import fr.fullstack.backend.dto.GameDetail;
import fr.fullstack.backend.dto.GameSummary;
import fr.fullstack.backend.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @GetMapping
    public ResponseEntity<Page<GameSummary>> getAllGames(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer genreId,
            Pageable pageable) {

        Page<GameSummary> games = gameService.getAllGames(search, genreId, pageable);
        return ResponseEntity.ok(games);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GameDetail> getGameById(@PathVariable Long id) {
        GameDetail gameDetail = gameService.getGameById(id);
        return ResponseEntity.ok(gameDetail);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGame(@PathVariable Long id) {
        gameService.deleteGame(id);
        return ResponseEntity.noContent().build();
    }
}