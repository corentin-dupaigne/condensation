package fr.fullstack.backend.controller;

import fr.fullstack.backend.dto.BalanceRequest;
import fr.fullstack.backend.service.BalanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/balance")
public class BalanceController {

    private final BalanceService balanceService;

    public BalanceController(BalanceService balanceService) {
        this.balanceService = balanceService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Integer>> getBalance(@AuthenticationPrincipal Jwt jwt) {
        int userId = Integer.parseInt(jwt.getSubject());
        return ResponseEntity.ok(Map.of("balance", balanceService.getBalance(userId)));
    }

    @PostMapping
    public ResponseEntity<Map<String, Boolean>> updateBalance(
            @RequestBody BalanceRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        int userId = Integer.parseInt(jwt.getSubject());
        boolean success = balanceService.updateBalance(userId, request.amount());
        return ResponseEntity.ok(Map.of("success", success));
    }
}
