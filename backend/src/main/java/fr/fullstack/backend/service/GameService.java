package fr.fullstack.backend.service;

import fr.fullstack.backend.entity.Game;
import fr.fullstack.backend.entity.Genre;
import fr.fullstack.backend.repository.GameRepository;
import fr.fullstack.backend.repository.SteamKeyRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class GameService {

    private final GameRepository gameRepository;
    private final SteamKeyRepository steamKeyRepository;

    public GameService(GameRepository gameRepository, SteamKeyRepository steamKeyRepository) {
        this.gameRepository = gameRepository;
        this.steamKeyRepository = steamKeyRepository;
    }

    @Transactional(readOnly = true)
    public Page<Game> getCatalog(String search, Integer genreId, Pageable pageable) {
        String cleanSearch = StringUtils.hasText(search) ? search : "";

        return gameRepository.findWithFilters(cleanSearch, genreId, pageable);
    }

    @Transactional(readOnly = true)
    public Game getGameDetails(Long id) {
        return gameRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Jeu non trouvé avec l'id: " + id));
    }

    @Transactional
    public void deleteGame(Long id) {
        if (!gameRepository.existsById(id)) {
            throw new EntityNotFoundException("Jeu non trouvé avec l'id: " + id);
        }
        gameRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public long getAvailableKeyCount(Long gameId) {
        if (!gameRepository.existsById(gameId)) {
            throw new EntityNotFoundException("Jeu non trouvé avec l'id: " + gameId);
        }
        return steamKeyRepository.countByGameId(gameId);
    }

    public List<Genre> getAllGenres() {
        return gameRepository.findAllGenres();
    }

}
