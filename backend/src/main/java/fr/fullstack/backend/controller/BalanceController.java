package fr.fullstack.backend.controller;

import fr.fullstack.backend.dto.BalanceRequest;
import fr.fullstack.backend.service.BalanceService;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Map<String, Integer>> getBalance(@RequestParam Integer userid) {
        return ResponseEntity.ok(Map.of("balance", balanceService.getBalance(userid)));
    }

    @PostMapping
    public ResponseEntity<Map<String, Boolean>> updateBalance(@RequestBody BalanceRequest request) {
        boolean success = balanceService.updateBalance(request.userid(), request.amount());
        return ResponseEntity.ok(Map.of("success", success));
    }
}
