package fr.fullstack.backend.repository;

import fr.fullstack.backend.entity.SteamKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SteamKeyRepository extends JpaRepository<SteamKey, Integer> {
    long countByGameId(Long gameId);

    Optional<SteamKey> findFirstByGameId(Long gameId);
}
