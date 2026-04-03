package fr.fullstack.backend.controller;

import fr.fullstack.backend.dto.GameDetailDto;
import fr.fullstack.backend.dto.GameSummaryDto;
import fr.fullstack.backend.dto.PageDto;
import fr.fullstack.backend.entity.Game;
import fr.fullstack.backend.mapper.CatalogMapper;
import fr.fullstack.backend.service.GameService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/games")
public class GameController {

    private final GameService gameService;
    private final CatalogMapper mapper;

    public GameController(GameService gameService, CatalogMapper mapper) {
        this.gameService = gameService;
        this.mapper = mapper;
    }

    @GetMapping
    public ResponseEntity<PageDto<GameSummaryDto>> getCatalog(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer genreId) {

        Page<Game> gamePage = gameService.getCatalog(search, genreId, PageRequest.of(page, size));
        List<GameSummaryDto> content = gamePage.getContent().stream().map(mapper::toGameSummaryDto).toList();

        return ResponseEntity.ok(mapper.toPageDto(gamePage, content));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GameDetailDto> getGameDetails(@PathVariable Long id) {
        Game game = gameService.getGameDetails(id);
        return ResponseEntity.ok(mapper.toGameDetailDto(game));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGame(@PathVariable Long id) {
        gameService.deleteGame(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/key_counts")
    public ResponseEntity<Map<String, Long>> getKeyCounts(@PathVariable Long id) {
        long count = gameService.getAvailableKeyCount(id);
        return ResponseEntity.ok(Map.of("key_counts", count));
    }
}