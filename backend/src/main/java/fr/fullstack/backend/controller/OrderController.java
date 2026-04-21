package fr.fullstack.backend.controller;

import fr.fullstack.backend.config.AuthServiceIntrospector.SimpleOAuth2Principal;
import fr.fullstack.backend.dto.OrderDto;
import fr.fullstack.backend.dto.OrderRequest;
import fr.fullstack.backend.entity.Order;
import fr.fullstack.backend.mapper.CatalogMapper;
import fr.fullstack.backend.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final CatalogMapper mapper;

    public OrderController(OrderService orderService, CatalogMapper mapper) {
        this.orderService = orderService;
        this.mapper = mapper;
    }

    @GetMapping
    public ResponseEntity<Map<String, List<OrderDto>>> getUserOrders(@AuthenticationPrincipal SimpleOAuth2Principal principal) {
        List<Order> orders = orderService.getUserOrders(principal.userId());
        return ResponseEntity.ok(Map.of("orders", mapper.toOrderDtoList(orders)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, OrderDto>> getOrderDetails(
            @PathVariable Integer id,
            @AuthenticationPrincipal SimpleOAuth2Principal principal) {
        Order order = orderService.getOrderDetails(id, principal.userId());
        return ResponseEntity.ok(Map.of("order", mapper.toOrderDto(order)));
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> createOrder(
            @RequestBody OrderRequest request,
            @AuthenticationPrincipal SimpleOAuth2Principal principal) {
        int userId = principal.userId();
        List<OrderService.OrderRequestItem> items = request.games().stream()
                .map(g -> {
                    OrderService.OrderRequestItem item = new OrderService.OrderRequestItem();
                    item.gameId = g.gameIds();
                    item.quantity = g.quantity();
                    return item;
                }).toList();

        orderService.createOrder(userId, items);

        return ResponseEntity.ok(Map.of("message", "Commande effectuée avec succès"));
    }
}
