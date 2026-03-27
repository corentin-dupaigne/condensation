package fr.fullstack.backend.service;

import fr.fullstack.backend.dto.GameDetail;
import fr.fullstack.backend.dto.GameSummary;
import fr.fullstack.backend.entity.Game;
import fr.fullstack.backend.mapper.GameMapper;
import fr.fullstack.backend.repository.GameRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRepository gameRepository;
    private final GameMapper gameMapper;

    @Transactional(readOnly = true)
    public Page<GameSummary> getAllGames(String search, Integer genreId, Pageable pageable) {
        Page<Game> games;

        if (search != null && !search.isBlank()) {
            games = gameRepository.searchByText(search, pageable);
        } else if (genreId != null) {
            games = gameRepository.findByGenreId(genreId, pageable);
        } else {
            games = gameRepository.findAll(pageable);
        }

        return games.map(gameMapper::toSummary);
    }

    @Transactional(readOnly = true)
    public GameDetail getGameById(Long id) {
        return gameRepository.findById(id)
                .map(gameMapper::toDetail)
                .orElseThrow(() -> new EntityNotFoundException("Le jeu avec l'ID " + id + " est introuvable."));
    }

    @Transactional
    public void deleteGame(Long id) {
        if (!gameRepository.existsById(id)) {
            throw new EntityNotFoundException("Le jeu avec l'ID " + id + " est introuvable.");
        }
        gameRepository.deleteById(id);
    }
}
