package fr.fullstack.backend.controller;

import fr.fullstack.backend.dto.AdminGameRequest;
import fr.fullstack.backend.dto.GameSummaryDto;
import fr.fullstack.backend.service.AdminGameService;
import fr.fullstack.backend.service.AuthProxyService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/games")
public class AdminGameController {

    private final AdminGameService adminGameService;
    private final AuthProxyService authProxyService;

    public AdminGameController(AdminGameService adminGameService, AuthProxyService authProxyService) {
        this.adminGameService = adminGameService;
        this.authProxyService = authProxyService;
    }

    @GetMapping
    public ResponseEntity<?> listGames(
            @RequestHeader(value = "Authorization", required = false) String auth) {
        if (authProxyService.requireAdminToken(auth) == null) return forbidden();
        List<GameSummaryDto> games = adminGameService.findAll();
        return ResponseEntity.ok(games);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getGame(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable Long id) {
        if (authProxyService.requireAdminToken(auth) == null) return forbidden();
        try {
            return ResponseEntity.ok(adminGameService.findById(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createGame(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @RequestBody AdminGameRequest request) {
        if (authProxyService.requireAdminToken(auth) == null) return forbidden();
        try {
            GameSummaryDto created = adminGameService.create(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateGame(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable Long id,
            @RequestBody AdminGameRequest request) {
        if (authProxyService.requireAdminToken(auth) == null) return forbidden();
        try {
            return ResponseEntity.ok(adminGameService.update(id, request));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGame(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable Long id) {
        if (authProxyService.requireAdminToken(auth) == null) return forbidden();
        try {
            adminGameService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    private ResponseEntity<?> forbidden() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Forbidden"));
    }
}
