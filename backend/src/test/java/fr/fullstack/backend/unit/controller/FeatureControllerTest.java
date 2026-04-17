package fr.fullstack.backend.unit.controller;

import fr.fullstack.backend.controller.FeatureController;
import fr.fullstack.backend.dto.FeatureDataDto;
import fr.fullstack.backend.dto.GameSummaryDto;
import fr.fullstack.backend.dto.PageDto;
import fr.fullstack.backend.entity.Game;
import fr.fullstack.backend.mapper.CatalogMapper;
import fr.fullstack.backend.service.FeatureService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FeatureControllerTest {

    @Mock
    private FeatureService featureService;

    @Mock
    private CatalogMapper mapper;

    @InjectMocks
    private FeatureController featureController;

    @Test
    void getFeatures_returnsPopulatedDto() {
        Page<Game> page = new PageImpl<>(List.of(new Game()));
        when(featureService.getTopSellers(any(Pageable.class))).thenReturn(page);
        when(featureService.getNewReleases(any(Pageable.class))).thenReturn(page);
        when(featureService.getUpcoming(any(Pageable.class))).thenReturn(page);
        when(featureService.getLowDealsUnder(any(Integer.class), any(Pageable.class))).thenReturn(page);

        GameSummaryDto dto = new GameSummaryDto(1L, 100, "G", "g", null, 100, 0, 0, null, List.of());
        when(mapper.toGameSummaryDto(any())).thenReturn(dto);
        when(mapper.toPageDto(any(Page.class), any())).thenReturn(new PageDto<>(List.of(dto), 1, 1));

        ResponseEntity<FeatureDataDto> response = featureController.getFeatures(0, 20);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().topseller()).isNotNull();
        assertThat(response.getBody().newRelease()).isNotNull();
        assertThat(response.getBody().upcoming()).isNotNull();
        assertThat(response.getBody().lowDeals()).isNotNull();
        assertThat(response.getBody().lowDeals().under5()).isNotNull();
        assertThat(response.getBody().lowDeals().under10()).isNotNull();
        assertThat(response.getBody().lowDeals().under20()).isNotNull();
    }

    @Test
    void getFeatures_callsLowDealsWithAllThreeThresholds() {
        Page<Game> empty = new PageImpl<>(List.of());
        when(featureService.getTopSellers(any(Pageable.class))).thenReturn(empty);
        when(featureService.getNewReleases(any(Pageable.class))).thenReturn(empty);
        when(featureService.getUpcoming(any(Pageable.class))).thenReturn(empty);
        when(featureService.getLowDealsUnder(any(Integer.class), any(Pageable.class))).thenReturn(empty);
        when(mapper.toPageDto(any(Page.class), any())).thenReturn(new PageDto<>(List.of(), 0, 0));

        featureController.getFeatures(0, 20);

        verify(featureService).getLowDealsUnder(eq(5), any(Pageable.class));
        verify(featureService).getLowDealsUnder(eq(10), any(Pageable.class));
        verify(featureService).getLowDealsUnder(eq(20), any(Pageable.class));
    }
}
