package fr.fullstack.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "screenshots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Screenshot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id")
    private Game game;

    @Column(name = "steam_id")
    private Integer steamId;

    @Column(name = "path_thumbnail", nullable = false, columnDefinition = "TEXT")
    private String pathThumbnail;

    @Column(name = "path_full", nullable = false, columnDefinition = "TEXT")
    private String pathFull;

    private Short position;
}