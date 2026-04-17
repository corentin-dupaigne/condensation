package fr.fullstack.backend.unit.service;

import fr.fullstack.backend.entity.Game;
import fr.fullstack.backend.repository.GameRepository;
import fr.fullstack.backend.service.FeatureService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FeatureServiceTest {

    @Mock
    private GameRepository gameRepository;

    @InjectMocks
    private FeatureService featureService;

    private final Pageable pageable = PageRequest.of(0, 10);

    @Test
    void getTopSellers_delegatesToRepository() {
        Game g = new Game();
        g.setId(1L);
        Page<Game> page = new PageImpl<>(List.of(g));
        when(gameRepository.findTopSellers(pageable)).thenReturn(page);

        Page<Game> result = featureService.getTopSellers(pageable);

        assertThat(result.getContent()).hasSize(1);
        verify(gameRepository).findTopSellers(pageable);
    }

    @Test
    void getNewReleases_delegatesToRepository() {
        Page<Game> page = new PageImpl<>(List.of());
        when(gameRepository.findNewReleases(pageable)).thenReturn(page);

        Page<Game> result = featureService.getNewReleases(pageable);

        assertThat(result.getContent()).isEmpty();
        verify(gameRepository).findNewReleases(pageable);
    }

    @Test
    void getUpcoming_delegatesToRepository() {
        Page<Game> page = new PageImpl<>(List.of());
        when(gameRepository.findUpcoming(pageable)).thenReturn(page);

        Page<Game> result = featureService.getUpcoming(pageable);

        assertThat(result.getContent()).isEmpty();
        verify(gameRepository).findUpcoming(pageable);
    }

    @Test
    void getLowDealsUnder_convertsEurosToCentsAndCalls() {
        Page<Game> page = new PageImpl<>(List.of());
        when(gameRepository.findLowDeals(500, pageable)).thenReturn(page);

        featureService.getLowDealsUnder(5, pageable);

        verify(gameRepository).findLowDeals(500, pageable);
    }

    @Test
    void getLowDealsUnder_under10Euros_uses1000Cents() {
        when(gameRepository.findLowDeals(1000, pageable)).thenReturn(new PageImpl<>(List.of()));

        featureService.getLowDealsUnder(10, pageable);

        verify(gameRepository).findLowDeals(1000, pageable);
    }

    @Test
    void getLowDealsUnder_under20Euros_uses2000Cents() {
        when(gameRepository.findLowDeals(2000, pageable)).thenReturn(new PageImpl<>(List.of()));

        featureService.getLowDealsUnder(20, pageable);

        verify(gameRepository).findLowDeals(2000, pageable);
    }
}
