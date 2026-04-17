package fr.fullstack.backend.unit.service;

import fr.fullstack.backend.entity.Balance;
import fr.fullstack.backend.repository.BalanceRepository;
import fr.fullstack.backend.service.BalanceService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BalanceServiceTest {

    @Mock
    private BalanceRepository balanceRepository;

    @InjectMocks
    private BalanceService balanceService;

    @Test
    void getBalance_existingUser_returnsBalance() {
        Balance balance = new Balance();
        balance.setUserId(42);
        balance.setBalance(2500);
        when(balanceRepository.findByUserId(42)).thenReturn(Optional.of(balance));

        Integer result = balanceService.getBalance(42);

        assertThat(result).isEqualTo(2500);
    }

    @Test
    void getBalance_nonExistingUser_returnsZero() {
        when(balanceRepository.findByUserId(999)).thenReturn(Optional.empty());

        Integer result = balanceService.getBalance(999);

        assertThat(result).isZero();
    }

    @Test
    void updateBalance_existingUserPositiveAmount_updatesAndReturnsTrue() {
        Balance balance = new Balance();
        balance.setUserId(1);
        balance.setBalance(1000);
        when(balanceRepository.findByUserId(1)).thenReturn(Optional.of(balance));

        boolean success = balanceService.updateBalance(1, 500);

        assertThat(success).isTrue();
        assertThat(balance.getBalance()).isEqualTo(1500);
        verify(balanceRepository).save(balance);
    }

    @Test
    void updateBalance_existingUserNegativeAmountSufficientFunds_updatesAndReturnsTrue() {
        Balance balance = new Balance();
        balance.setUserId(1);
        balance.setBalance(1000);
        when(balanceRepository.findByUserId(1)).thenReturn(Optional.of(balance));

        boolean success = balanceService.updateBalance(1, -400);

        assertThat(success).isTrue();
        assertThat(balance.getBalance()).isEqualTo(600);
        verify(balanceRepository).save(balance);
    }

    @Test
    void updateBalance_insufficientFunds_returnsFalseAndDoesNotSave() {
        Balance balance = new Balance();
        balance.setUserId(1);
        balance.setBalance(200);
        when(balanceRepository.findByUserId(1)).thenReturn(Optional.of(balance));

        boolean success = balanceService.updateBalance(1, -500);

        assertThat(success).isFalse();
        assertThat(balance.getBalance()).isEqualTo(200);
        verify(balanceRepository, never()).save(any());
    }

    @Test
    void updateBalance_newUser_createsBalanceWithZeroAndAdds() {
        when(balanceRepository.findByUserId(99)).thenReturn(Optional.empty());

        boolean success = balanceService.updateBalance(99, 300);

        assertThat(success).isTrue();
        ArgumentCaptor<Balance> captor = ArgumentCaptor.forClass(Balance.class);
        verify(balanceRepository).save(captor.capture());
        Balance saved = captor.getValue();
        assertThat(saved.getUserId()).isEqualTo(99);
        assertThat(saved.getBalance()).isEqualTo(300);
    }

    @Test
    void updateBalance_newUserNegativeAmount_returnsFalse() {
        when(balanceRepository.findByUserId(99)).thenReturn(Optional.empty());

        boolean success = balanceService.updateBalance(99, -10);

        assertThat(success).isFalse();
        verify(balanceRepository, never()).save(any());
    }

    @Test
    void updateBalance_exactlyToZero_returnsTrueAndSaves() {
        Balance balance = new Balance();
        balance.setBalance(100);
        when(balanceRepository.findByUserId(1)).thenReturn(Optional.of(balance));

        boolean success = balanceService.updateBalance(1, -100);

        assertThat(success).isTrue();
        assertThat(balance.getBalance()).isZero();
        verify(balanceRepository).save(balance);
    }

    @Test
    void updateBalance_zeroAmount_staysTheSame() {
        Balance balance = new Balance();
        balance.setBalance(500);
        when(balanceRepository.findByUserId(1)).thenReturn(Optional.of(balance));

        boolean success = balanceService.updateBalance(1, 0);

        assertThat(success).isTrue();
        assertThat(balance.getBalance()).isEqualTo(500);
    }
}
