package fr.fullstack.backend.controller;

import fr.fullstack.backend.dto.InternalBalanceRequest;
import fr.fullstack.backend.service.BalanceService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/internal/balance")
public class InternalBalanceController {

    private final BalanceService balanceService;
    private final String internalSecret;

    public InternalBalanceController(BalanceService balanceService,
                                     @Value("${internal.secret}") String internalSecret) {
        this.balanceService = balanceService;
        this.internalSecret = internalSecret;
    }

    @PostMapping
    public ResponseEntity<Map<String, Boolean>> updateBalance(
            @RequestHeader("X-Internal-Secret") String secret,
            @RequestBody InternalBalanceRequest request) {
        if (!internalSecret.equals(secret)) {
            return ResponseEntity.status(403).build();
        }
        boolean success = balanceService.updateBalance(request.userid(), request.amount());
        return ResponseEntity.ok(Map.of("success", success));
    }
}
