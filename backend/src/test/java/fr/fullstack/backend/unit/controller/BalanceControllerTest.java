package fr.fullstack.backend.unit.controller;

import fr.fullstack.backend.config.AuthServiceIntrospector.SimpleOAuth2Principal;
import fr.fullstack.backend.controller.BalanceController;
import fr.fullstack.backend.dto.BalanceRequest;
import fr.fullstack.backend.service.BalanceService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BalanceControllerTest {

    @Mock
    private BalanceService balanceService;

    @InjectMocks
    private BalanceController balanceController;

    @Test
    void getBalance_returnsServiceResult() {
        when(balanceService.getBalance(7)).thenReturn(1234);

        ResponseEntity<Map<String, Integer>> response = balanceController.getBalance(new SimpleOAuth2Principal(7));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("balance", 1234);
    }

    @Test
    void getBalance_zero_returnsZero() {
        when(balanceService.getBalance(1)).thenReturn(0);

        ResponseEntity<Map<String, Integer>> response = balanceController.getBalance(new SimpleOAuth2Principal(1));

        assertThat(response.getBody()).containsEntry("balance", 0);
    }

    @Test
    void updateBalance_success_returnsTrue() {
        BalanceRequest req = new BalanceRequest(500);
        when(balanceService.updateBalance(1, 500)).thenReturn(true);

        ResponseEntity<Map<String, Boolean>> response = balanceController.updateBalance(req, new SimpleOAuth2Principal(1));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("success", true);
        verify(balanceService).updateBalance(1, 500);
    }

    @Test
    void updateBalance_failure_returnsFalse() {
        BalanceRequest req = new BalanceRequest(-5000);
        when(balanceService.updateBalance(1, -5000)).thenReturn(false);

        ResponseEntity<Map<String, Boolean>> response = balanceController.updateBalance(req, new SimpleOAuth2Principal(1));

        assertThat(response.getBody()).containsEntry("success", false);
    }
}
