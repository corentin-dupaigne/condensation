package fr.fullstack.backend.unit.controller;

import fr.fullstack.backend.controller.OrderController;
import fr.fullstack.backend.dto.OrderDto;
import fr.fullstack.backend.dto.OrderRequest;
import fr.fullstack.backend.entity.Order;
import fr.fullstack.backend.mapper.CatalogMapper;
import fr.fullstack.backend.service.OrderService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderControllerTest {

    @Mock
    private OrderService orderService;

    @Mock
    private CatalogMapper mapper;

    @InjectMocks
    private OrderController orderController;

    @Test
    void getUserOrders_returnsMappedDtos() {
        Order o = new Order();
        o.setId(1);
        o.setUserId(7);
        OrderDto dto = new OrderDto(1, 7, 10L, "KEY-XXX", null);
        when(orderService.getUserOrders(7)).thenReturn(List.of(o));
        when(mapper.toOrderDtoList(List.of(o))).thenReturn(List.of(dto));

        ResponseEntity<Map<String, List<OrderDto>>> response = orderController.getUserOrders(7);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsKey("orders");
        assertThat(response.getBody().get("orders")).hasSize(1);
    }

    @Test
    void getOrderDetails_returnsMappedSingleDto() {
        Order o = new Order();
        OrderDto dto = new OrderDto(1, 7, 10L, "KEY-XXX", null);
        when(orderService.getOrderDetails(1, 7)).thenReturn(o);
        when(mapper.toOrderDto(o)).thenReturn(dto);

        ResponseEntity<Map<String, OrderDto>> response = orderController.getOrderDetails(1, 7);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsKey("order");
        assertThat(response.getBody().get("order").id()).isEqualTo(1);
    }

    @Test
    void createOrder_delegatesToServiceAndReturnsSuccess() {
        OrderRequest req = new OrderRequest(7, List.of(
                new OrderRequest.OrderRequestItem(10L, 2),
                new OrderRequest.OrderRequestItem(20L, 1)
        ));
        when(orderService.createOrder(eq(7), any())).thenReturn(List.of());

        ResponseEntity<Map<String, String>> response = orderController.createOrder(req);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("message", "Commande effectuée avec succès");
    }

    @Test
    void createOrder_translatesRequestItemsCorrectly() {
        OrderRequest req = new OrderRequest(7, List.of(
                new OrderRequest.OrderRequestItem(10L, 2),
                new OrderRequest.OrderRequestItem(20L, 3)
        ));
        when(orderService.createOrder(eq(7), any())).thenReturn(List.of());

        orderController.createOrder(req);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<OrderService.OrderRequestItem>> captor =
                ArgumentCaptor.forClass(List.class);
        verify(orderService).createOrder(eq(7), captor.capture());

        List<OrderService.OrderRequestItem> items = captor.getValue();
        assertThat(items).hasSize(2);
        assertThat(items.get(0).gameId).isEqualTo(10L);
        assertThat(items.get(0).quantity).isEqualTo(2);
        assertThat(items.get(1).gameId).isEqualTo(20L);
        assertThat(items.get(1).quantity).isEqualTo(3);
    }

    @Test
    void createOrder_withEmptyGames_stillCallsService() {
        OrderRequest req = new OrderRequest(7, List.of());
        when(orderService.createOrder(eq(7), any())).thenReturn(List.of());

        ResponseEntity<Map<String, String>> response = orderController.createOrder(req);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(orderService).createOrder(eq(7), any());
    }
}
