package fr.fullstack.backend.repository;

import fr.fullstack.backend.entity.Game;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {

    Optional<Game> findBySlug(String slug);
    Optional<Game> findBySteamAppId(Integer steamAppId);

    Page<Game> findByPlatformWindowsTrue(Pageable pageable);

    @Query("SELECT g FROM Game g JOIN g.genres genre WHERE genre.id = :genreId")
    Page<Game> findByGenreId(@Param("genreId") Integer genreId, Pageable pageable);

    @Query(value = "SELECT * FROM games WHERE search_vector @@ websearch_to_tsquery('english', :searchTerm)",
            countQuery = "SELECT count(*) FROM games WHERE search_vector @@ websearch_to_tsquery('english', :searchTerm)",
            nativeQuery = true)
    Page<Game> searchByText(@Param("searchTerm") String searchTerm, Pageable pageable);
}