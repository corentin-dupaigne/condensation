package fr.fullstack.backend.service;

import fr.fullstack.backend.entity.Game;
import fr.fullstack.backend.repository.GameRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeatureService {

    private final GameRepository gameRepository;

    public FeatureService(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    @Transactional(readOnly = true)
    public Page<Game> getTopSellers(Pageable pageable) {
        return gameRepository.findTopSellers(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Game> getNewReleases(Pageable pageable) {
        return gameRepository.findNewReleases(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Game> getUpcoming(Pageable pageable) {
        return gameRepository.findUpcoming(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Game> getLowDealsUnder(Integer priceInEuros, Pageable pageable) {
        Integer maxPriceCents = priceInEuros * 100;
        return gameRepository.findLowDeals(maxPriceCents, pageable);
    }
}
