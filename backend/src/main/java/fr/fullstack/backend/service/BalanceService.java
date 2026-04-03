package fr.fullstack.backend.service;

import fr.fullstack.backend.entity.Balance;
import fr.fullstack.backend.repository.BalanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BalanceService {

    private final BalanceRepository balanceRepository;

    public BalanceService(BalanceRepository balanceRepository) {
        this.balanceRepository = balanceRepository;
    }

    @Transactional(readOnly = true)
    public Integer getBalance(Integer userId) {
        return balanceRepository.findByUserId(userId)
                .map(Balance::getBalance)
                .orElse(0);
    }

    @Transactional
    public boolean updateBalance(Integer userId, Integer amountToAdd) {
        Balance balance = balanceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Balance newBalance = new Balance();
                    newBalance.setUserId(userId);
                    newBalance.setBalance(0);
                    return newBalance;
                });

        int newTotal = balance.getBalance() + amountToAdd;

        if (newTotal < 0) {
            return false;
        }

        balance.setBalance(newTotal);
        balanceRepository.save(balance);
        return true;
    }
}