package fr.fullstack.backend.controller;

import fr.fullstack.backend.dto.OrderRequest;
import fr.fullstack.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/internal/orders")
public class InternalOrderController {

    private final OrderService orderService;
    private final String internalSecret;

    public InternalOrderController(OrderService orderService,
                                   @Value("${internal.secret}") String internalSecret) {
        this.orderService = orderService;
        this.internalSecret = internalSecret;
    }

    public record InternalOrderRequest(Integer userid, List<OrderRequest.OrderRequestItem> games) {}

    @PostMapping
    public ResponseEntity<Map<String, String>> createOrder(
            @RequestHeader("X-Internal-Secret") String secret,
            @RequestBody InternalOrderRequest request) {
        if (!internalSecret.equals(secret)) {
            return ResponseEntity.status(403).build();
        }

        List<OrderService.OrderRequestItem> items = request.games().stream()
                .map(g -> {
                    OrderService.OrderRequestItem item = new OrderService.OrderRequestItem();
                    item.gameId = g.gameIds();
                    item.quantity = g.quantity();
                    return item;
                }).toList();

        orderService.createOrder(request.userid(), items);

        return ResponseEntity.ok(Map.of("message", "Commande effectuée avec succès"));
    }
}
