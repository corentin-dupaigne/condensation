package fr.fullstack.backend.controller;

import fr.fullstack.backend.config.AuthServiceIntrospector.SimpleOAuth2Principal;
import fr.fullstack.backend.dto.BalanceRequest;
import fr.fullstack.backend.service.BalanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    public ResponseEntity<Map<String, Integer>> getBalance(@AuthenticationPrincipal SimpleOAuth2Principal principal) {
        return ResponseEntity.ok(Map.of("balance", balanceService.getBalance(principal.userId())));
    }

    @PostMapping
    public ResponseEntity<Map<String, Boolean>> updateBalance(
            @RequestBody BalanceRequest request,
            @AuthenticationPrincipal SimpleOAuth2Principal principal) {
        boolean success = balanceService.updateBalance(principal.userId(), request.amount());
        return ResponseEntity.ok(Map.of("success", success));
    }
}
