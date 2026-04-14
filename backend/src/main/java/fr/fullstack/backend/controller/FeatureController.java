package fr.fullstack.backend.controller;
import fr.fullstack.backend.dto.FeatureDataDto;
import fr.fullstack.backend.dto.GameSummaryDto;
import fr.fullstack.backend.dto.PageDto;
import fr.fullstack.backend.entity.Game;
import fr.fullstack.backend.mapper.CatalogMapper;
import fr.fullstack.backend.service.FeatureService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feature")
public class FeatureController {

    private final FeatureService featureService;
    private final CatalogMapper mapper;

    public FeatureController(FeatureService featureService, CatalogMapper mapper) {
        this.featureService = featureService;
        this.mapper = mapper;
    }

    @GetMapping
    public ResponseEntity<FeatureDataDto> getFeatures(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pr = PageRequest.of(page, size);

        Page<Game> topSellersPage = featureService.getTopSellers(pr);
        Page<Game> newReleasesPage = featureService.getNewReleases(pr);
        Page<Game> upcomingPage = featureService.getUpcoming(pr);

        Page<Game> under5Page = featureService.getLowDealsUnder(5, pr);
        Page<Game> under10Page = featureService.getLowDealsUnder(10, pr);
        Page<Game> under20Page = featureService.getLowDealsUnder(20, pr);

        PageDto<GameSummaryDto> topSellersDto = mapper.toPageDto(topSellersPage, topSellersPage.stream().map(mapper::toGameSummaryDto).toList());
        PageDto<GameSummaryDto> newReleasesDto = mapper.toPageDto(newReleasesPage, newReleasesPage.stream().map(mapper::toGameSummaryDto).toList());
        PageDto<GameSummaryDto> upcomingDto = mapper.toPageDto(upcomingPage, upcomingPage.stream().map(mapper::toGameSummaryDto).toList());

        FeatureDataDto.LowDealsDto lowDealsDto = new FeatureDataDto.LowDealsDto(
                mapper.toPageDto(under5Page, under5Page.stream().map(mapper::toGameSummaryDto).toList()),
                mapper.toPageDto(under10Page, under10Page.stream().map(mapper::toGameSummaryDto).toList()),
                mapper.toPageDto(under20Page, under20Page.stream().map(mapper::toGameSummaryDto).toList())
        );

        return ResponseEntity.ok(new FeatureDataDto(topSellersDto, newReleasesDto, lowDealsDto, upcomingDto));
    }
}
