package fr.fullstack.backend.service;

import fr.fullstack.backend.dto.AdminOrderDto;
import fr.fullstack.backend.dto.AdminOrderRequest;
import fr.fullstack.backend.entity.Game;
import fr.fullstack.backend.entity.Order;
import fr.fullstack.backend.repository.GameRepository;
import fr.fullstack.backend.repository.OrderRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminOrderService {

    private final OrderRepository orderRepository;
    private final GameRepository gameRepository;

    public AdminOrderService(OrderRepository orderRepository, GameRepository gameRepository) {
        this.orderRepository = orderRepository;
        this.gameRepository = gameRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminOrderDto> findAll() {
        return orderRepository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public AdminOrderDto findById(Integer id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + id));
        return toDto(order);
    }

    @Transactional
    public AdminOrderDto create(AdminOrderRequest request) {
        Game game = gameRepository.findById(request.gamesId())
                .orElseThrow(() -> new EntityNotFoundException("Game not found: " + request.gamesId()));
        Order order = new Order();
        order.setUserId(request.userId());
        order.setGame(game);
        order.setKey(request.key() != null ? request.key() : "");
        return toDto(orderRepository.save(order));
    }

    @Transactional
    public AdminOrderDto update(Integer id, AdminOrderRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + id));
        if (request.userId() != null) order.setUserId(request.userId());
        if (request.gamesId() != null) {
            Game game = gameRepository.findById(request.gamesId())
                    .orElseThrow(() -> new EntityNotFoundException("Game not found: " + request.gamesId()));
            order.setGame(game);
        }
        if (request.key() != null) order.setKey(request.key());
        return toDto(orderRepository.save(order));
    }

    @Transactional
    public void delete(Integer id) {
        if (!orderRepository.existsById(id)) {
            throw new EntityNotFoundException("Order not found: " + id);
        }
        orderRepository.deleteById(id);
    }

    private AdminOrderDto toDto(Order order) {
        Long gameId = order.getGame() != null ? order.getGame().getId() : null;
        return new AdminOrderDto(order.getId(), order.getUserId(), gameId, order.getKey());
    }
}
