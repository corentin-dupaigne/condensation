package fr.fullstack.backend.service;

import fr.fullstack.backend.entity.Balance;
import fr.fullstack.backend.entity.Game;
import fr.fullstack.backend.entity.Order;
import fr.fullstack.backend.entity.SteamKey;
import fr.fullstack.backend.repository.BalanceRepository;
import fr.fullstack.backend.repository.GameRepository;
import fr.fullstack.backend.repository.OrderRepository;
import fr.fullstack.backend.repository.SteamKeyRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final GameRepository gameRepository;
    private final SteamKeyRepository steamKeyRepository;
    private final BalanceRepository balanceRepository;

    public OrderService(OrderRepository orderRepository, GameRepository gameRepository,
                        SteamKeyRepository steamKeyRepository, BalanceRepository balanceRepository) {
        this.orderRepository = orderRepository;
        this.gameRepository = gameRepository;
        this.steamKeyRepository = steamKeyRepository;
        this.balanceRepository = balanceRepository;
    }

    @Transactional(readOnly = true)
    public List<Order> getUserOrders(Integer userId) {
        return orderRepository.findByUserIdWithGameAndGenres(userId);
    }

    @Transactional(readOnly = true)
    public Order getOrderDetails(Integer orderId, Integer userId) {
        return orderRepository.findByIdAndUserIdWithGameAndGenres(orderId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Commande introuvable ou n'appartient pas à cet utilisateur"));
    }

    public static class OrderRequestItem {
        public Long gameId;
        public Integer quantity;
    }

    @Transactional
    public List<Order> createOrder(Integer userId, List<OrderRequestItem> items) {
        Balance userBalance = balanceRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Portefeuille utilisateur introuvable"));

        int totalCartPrice = 0;
        List<Order> generatedOrders = new ArrayList<>();

        for (OrderRequestItem item : items) {
            Game game = gameRepository.findById(item.gameId)
                    .orElseThrow(() -> new EntityNotFoundException("Jeu introuvable: " + item.gameId));

            long availableKeys = steamKeyRepository.countByGameId(item.gameId);
            if (availableKeys < item.quantity) {
                throw new IllegalStateException("Stock insuffisant pour le jeu: " + game.getName());
            }

            int finalPrice = game.getPriceInitial();
            if (game.getReductionPercentage() != null && game.getReductionPercentage() > 0) {
                finalPrice = finalPrice * (100 - game.getReductionPercentage()) / 100;
            }

            totalCartPrice += (finalPrice * item.quantity);
        }

        if (userBalance.getBalance() < totalCartPrice) {
            throw new IllegalStateException("Solde insuffisant pour effectuer cette commande");
        }

        userBalance.setBalance(userBalance.getBalance() - totalCartPrice);
        balanceRepository.save(userBalance);

        for (OrderRequestItem item : items) {
            Game game = gameRepository.findById(item.gameId).get();

            for (int i = 0; i < item.quantity; i++) {
                SteamKey steamKey = steamKeyRepository.findFirstByGameId(item.gameId)
                        .orElseThrow(() -> new IllegalStateException("Conflit de stock (Concurrency)"));

                steamKeyRepository.delete(steamKey);

                Order order = new Order();
                order.setUserId(userId);
                order.setGame(game);
                order.setKey(steamKey.getKey());

                generatedOrders.add(orderRepository.save(order));
            }
        }

        return generatedOrders;
    }
}