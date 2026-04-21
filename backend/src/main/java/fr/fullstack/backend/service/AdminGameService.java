package fr.fullstack.backend.service;

import fr.fullstack.backend.dto.AdminGameRequest;
import fr.fullstack.backend.dto.GameSummaryDto;
import fr.fullstack.backend.entity.Game;
import fr.fullstack.backend.mapper.CatalogMapper;
import fr.fullstack.backend.repository.GameRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Service
public class AdminGameService {

    private final GameRepository gameRepository;
    private final CatalogMapper catalogMapper;

    public AdminGameService(GameRepository gameRepository, CatalogMapper catalogMapper) {
        this.gameRepository = gameRepository;
        this.catalogMapper = catalogMapper;
    }

    @Transactional(readOnly = true)
    public List<GameSummaryDto> findAll() {
        return gameRepository.findAll().stream()
                .map(catalogMapper::toGameSummaryDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public GameSummaryDto findById(Long id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Game not found: " + id));
        return catalogMapper.toGameSummaryDto(game);
    }

    @Transactional
    public GameSummaryDto create(AdminGameRequest request) {
        Game game = new Game();
        applyRequest(game, request);
        game.setUpdatedAt(OffsetDateTime.now());
        return catalogMapper.toGameSummaryDto(gameRepository.save(game));
    }

    @Transactional
    public GameSummaryDto update(Long id, AdminGameRequest request) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Game not found: " + id));
        applyRequest(game, request);
        game.setUpdatedAt(OffsetDateTime.now());
        return catalogMapper.toGameSummaryDto(gameRepository.save(game));
    }

    @Transactional
    public void delete(Long id) {
        if (!gameRepository.existsById(id)) {
            throw new EntityNotFoundException("Game not found: " + id);
        }
        gameRepository.deleteById(id);
    }

    private void applyRequest(Game game, AdminGameRequest req) {
        if (req.steamAppId() != null) game.setSteamAppId(req.steamAppId());
        if (req.name() != null) game.setName(req.name());
        if (req.slug() != null) game.setSlug(req.slug());
        if (req.headerImage() != null) game.setHeaderImage(req.headerImage());

        Integer reduction = req.reductionPercentage() != null ? req.reductionPercentage() : 0;
        game.setReductionPercentage(reduction);

        // Frontend sends priceFinal (the final price in cents); store as priceInitial.
        // priceInitial = priceFinal * 100 / (100 - reduction) when reduction > 0,
        // otherwise priceInitial = priceFinal.
        if (req.priceFinal() != null) {
            if (reduction > 0 && reduction < 100) {
                game.setPriceInitial(req.priceFinal() * 100 / (100 - reduction));
            } else {
                game.setPriceInitial(req.priceFinal());
            }
        }

        if (req.releaseDate() != null && !req.releaseDate().isBlank()) {
            game.setReleaseDate(LocalDate.parse(req.releaseDate()));
        }
    }
}
