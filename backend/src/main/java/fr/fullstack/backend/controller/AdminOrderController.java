package fr.fullstack.backend.controller;

import fr.fullstack.backend.dto.AdminOrderDto;
import fr.fullstack.backend.dto.AdminOrderRequest;
import fr.fullstack.backend.service.AdminOrderService;
import fr.fullstack.backend.service.AuthProxyService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final AdminOrderService adminOrderService;
    private final AuthProxyService authProxyService;

    public AdminOrderController(AdminOrderService adminOrderService, AuthProxyService authProxyService) {
        this.adminOrderService = adminOrderService;
        this.authProxyService = authProxyService;
    }

    @GetMapping
    public ResponseEntity<?> listOrders(
            @RequestHeader(value = "Authorization", required = false) String auth) {
        if (authProxyService.requireAdminToken(auth) == null) return forbidden();
        List<AdminOrderDto> orders = adminOrderService.findAll();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable Integer id) {
        if (authProxyService.requireAdminToken(auth) == null) return forbidden();
        try {
            return ResponseEntity.ok(adminOrderService.findById(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @RequestBody AdminOrderRequest request) {
        if (authProxyService.requireAdminToken(auth) == null) return forbidden();
        try {
            AdminOrderDto created = adminOrderService.create(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrder(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable Integer id,
            @RequestBody AdminOrderRequest request) {
        if (authProxyService.requireAdminToken(auth) == null) return forbidden();
        try {
            return ResponseEntity.ok(adminOrderService.update(id, request));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable Integer id) {
        if (authProxyService.requireAdminToken(auth) == null) return forbidden();
        try {
            adminOrderService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    private ResponseEntity<?> forbidden() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Forbidden"));
    }
}
