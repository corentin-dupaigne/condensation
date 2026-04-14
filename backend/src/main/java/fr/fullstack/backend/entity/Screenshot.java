package fr.fullstack.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "screenshots")
@Getter
@Setter
@NoArgsConstructor
public class Screenshot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id")
    private Game game;

    @Column(name = "steam_id")
    private Integer steamId;

    @Column(name = "path_thumbnail", columnDefinition = "TEXT", nullable = false)
    private String pathThumbnail;

    @Column(name = "path_full", columnDefinition = "TEXT", nullable = false)
    private String pathFull;

    private Short position = 0;
}
