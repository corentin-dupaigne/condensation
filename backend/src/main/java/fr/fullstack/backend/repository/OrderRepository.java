package fr.fullstack.backend.repository;

import fr.fullstack.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByUserId(Integer userId);
    Optional<Order> findByIdAndUserId(Integer id, Integer userId);

    @Query("SELECT o FROM Order o JOIN FETCH o.game g LEFT JOIN FETCH g.genres WHERE o.userId = :userId")
    List<Order> findByUserIdWithGameAndGenres(@Param("userId") Integer userId);

    @Query("SELECT o FROM Order o JOIN FETCH o.game g LEFT JOIN FETCH g.genres WHERE o.id = :id AND o.userId = :userId")
    Optional<Order> findByIdAndUserIdWithGameAndGenres(@Param("id") Integer id, @Param("userId") Integer userId);
}
