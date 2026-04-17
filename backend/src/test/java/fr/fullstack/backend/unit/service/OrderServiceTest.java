package fr.fullstack.backend.unit.service;

import fr.fullstack.backend.entity.Balance;
import fr.fullstack.backend.entity.Game;
import fr.fullstack.backend.entity.Order;
import fr.fullstack.backend.entity.SteamKey;
import fr.fullstack.backend.repository.BalanceRepository;
import fr.fullstack.backend.repository.GameRepository;
import fr.fullstack.backend.repository.OrderRepository;
import fr.fullstack.backend.repository.SteamKeyRepository;
import fr.fullstack.backend.service.OrderService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private GameRepository gameRepository;

    @Mock
    private SteamKeyRepository steamKeyRepository;

    @Mock
    private BalanceRepository balanceRepository;

    @InjectMocks
    private OrderService orderService;

    private Game game;
    private Balance balance;

    @BeforeEach
    void setUp() {
        game = new Game();
        game.setId(10L);
        game.setName("Half-Life 3");
        game.setPriceInitial(2000);
        game.setReductionPercentage(0);

        balance = new Balance();
        balance.setUserId(5);
        balance.setBalance(10000);
    }

    @Test
    void getUserOrders_returnsRepositoryResults() {
        Order o = new Order();
        when(orderRepository.findByUserIdWithGameAndGenres(5)).thenReturn(List.of(o));

        List<Order> result = orderService.getUserOrders(5);

        assertThat(result).hasSize(1);
    }

    @Test
    void getOrderDetails_existing_returnsOrder() {
        Order o = new Order();
        when(orderRepository.findByIdAndUserIdWithGameAndGenres(1, 5)).thenReturn(Optional.of(o));

        Order result = orderService.getOrderDetails(1, 5);

        assertThat(result).isSameAs(o);
    }

    @Test
    void getOrderDetails_missing_throwsEntityNotFound() {
        when(orderRepository.findByIdAndUserIdWithGameAndGenres(1, 5)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.getOrderDetails(1, 5))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void createOrder_noBalance_throwsIllegalState() {
        OrderService.OrderRequestItem item = new OrderService.OrderRequestItem();
        item.gameId = 10L;
        item.quantity = 1;
        when(balanceRepository.findByUserId(5)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.createOrder(5, List.of(item)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Portefeuille");
    }

    @Test
    void createOrder_gameNotFound_throwsEntityNotFound() {
        OrderService.OrderRequestItem item = new OrderService.OrderRequestItem();
        item.gameId = 999L;
        item.quantity = 1;
        when(balanceRepository.findByUserId(5)).thenReturn(Optional.of(balance));
        when(gameRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.createOrder(5, List.of(item)))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    void createOrder_insufficientStock_throwsIllegalState() {
        OrderService.OrderRequestItem item = new OrderService.OrderRequestItem();
        item.gameId = 10L;
        item.quantity = 5;
        when(balanceRepository.findByUserId(5)).thenReturn(Optional.of(balance));
        when(gameRepository.findById(10L)).thenReturn(Optional.of(game));
        when(steamKeyRepository.countByGameId(10L)).thenReturn(2L);

        assertThatThrownBy(() -> orderService.createOrder(5, List.of(item)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Stock insuffisant");
    }

    @Test
    void createOrder_insufficientBalance_throwsIllegalState() {
        OrderService.OrderRequestItem item = new OrderService.OrderRequestItem();
        item.gameId = 10L;
        item.quantity = 1;
        balance.setBalance(100); // insufficient for 2000
        when(balanceRepository.findByUserId(5)).thenReturn(Optional.of(balance));
        when(gameRepository.findById(10L)).thenReturn(Optional.of(game));
        when(steamKeyRepository.countByGameId(10L)).thenReturn(10L);

        assertThatThrownBy(() -> orderService.createOrder(5, List.of(item)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Solde insuffisant");

        verify(balanceRepository, never()).save(any());
        verify(steamKeyRepository, never()).delete(any());
    }

    @Test
    void createOrder_success_createsOrdersAndDebitsBalance() {
        OrderService.OrderRequestItem item = new OrderService.OrderRequestItem();
        item.gameId = 10L;
        item.quantity = 2;
        when(balanceRepository.findByUserId(5)).thenReturn(Optional.of(balance));
        when(gameRepository.findById(10L)).thenReturn(Optional.of(game));
        when(steamKeyRepository.countByGameId(10L)).thenReturn(5L);

        SteamKey key1 = new SteamKey();
        key1.setKey("AAAA-BBBB-CCCC1");
        SteamKey key2 = new SteamKey();
        key2.setKey("AAAA-BBBB-CCCC2");
        when(steamKeyRepository.findFirstByGameId(10L))
                .thenReturn(Optional.of(key1))
                .thenReturn(Optional.of(key2));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        List<Order> created = orderService.createOrder(5, List.of(item));

        assertThat(created).hasSize(2);
        assertThat(balance.getBalance()).isEqualTo(10000 - 2 * 2000);
        verify(balanceRepository).save(balance);
        verify(steamKeyRepository).delete(key1);
        verify(steamKeyRepository).delete(key2);
        verify(orderRepository, times(2)).save(any(Order.class));
    }

    @Test
    void createOrder_appliesReductionToPrice() {
        game.setReductionPercentage(50);
        OrderService.OrderRequestItem item = new OrderService.OrderRequestItem();
        item.gameId = 10L;
        item.quantity = 1;
        balance.setBalance(1200); // enough for 1000 (after 50% off), not enough for 2000

        when(balanceRepository.findByUserId(5)).thenReturn(Optional.of(balance));
        when(gameRepository.findById(10L)).thenReturn(Optional.of(game));
        when(steamKeyRepository.countByGameId(10L)).thenReturn(5L);

        SteamKey key = new SteamKey();
        key.setKey("K1");
        when(steamKeyRepository.findFirstByGameId(10L)).thenReturn(Optional.of(key));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        List<Order> orders = orderService.createOrder(5, List.of(item));

        assertThat(orders).hasSize(1);
        assertThat(balance.getBalance()).isEqualTo(1200 - 1000);
    }

    @Test
    void createOrder_keyDisappearsBeforeClaim_throwsConcurrencyError() {
        OrderService.OrderRequestItem item = new OrderService.OrderRequestItem();
        item.gameId = 10L;
        item.quantity = 1;
        when(balanceRepository.findByUserId(5)).thenReturn(Optional.of(balance));
        when(gameRepository.findById(10L)).thenReturn(Optional.of(game));
        when(steamKeyRepository.countByGameId(10L)).thenReturn(1L);
        when(steamKeyRepository.findFirstByGameId(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.createOrder(5, List.of(item)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Concurrency");
    }
}
