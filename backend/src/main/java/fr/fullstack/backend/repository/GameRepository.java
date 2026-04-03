package fr.fullstack.backend.repository;

import fr.fullstack.backend.entity.Game;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {

    @Query("SELECT DISTINCT g FROM Game g LEFT JOIN g.genres genre " +
            "WHERE (:search IS NULL OR LOWER(g.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:genreId IS NULL OR genre.id = :genreId)")
    Page<Game> findWithFilters(@Param("search") String search,
                               @Param("genreId") Integer genreId,
                               Pageable pageable);

    @Query("SELECT g FROM Game g ORDER BY g.recommendationsTotal DESC")
    Page<Game> findTopSellers(Pageable pageable);

    @Query("SELECT g FROM Game g WHERE g.releaseDate <= CURRENT_DATE ORDER BY g.releaseDate DESC")
    Page<Game> findNewReleases(Pageable pageable);

    @Query("SELECT g FROM Game g WHERE g.releaseDate > CURRENT_DATE ORDER BY g.releaseDate ASC")
    Page<Game> findUpcoming(Pageable pageable);

    @Query("SELECT g FROM Game g WHERE g.reductionPercentage > 0 AND " +
            "(g.priceInitial * (100 - g.reductionPercentage) / 100) < :maxPriceCents " +
            "ORDER BY (g.priceInitial * (100 - g.reductionPercentage) / 100) DESC")
    Page<Game> findLowDeals(@Param("maxPriceCents") Integer maxPriceCents, Pageable pageable);
}