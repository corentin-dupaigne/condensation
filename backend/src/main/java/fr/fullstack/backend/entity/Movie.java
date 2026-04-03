package fr.fullstack.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "movies")
@Getter
@Setter
@NoArgsConstructor
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id")
    private Game game;

    @Column(name = "steam_id")
    private Integer steamId;

    @Column(length = 500)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String thumbnail;

    @Column(name = "dash_av1", columnDefinition = "TEXT")
    private String dashAv1;

    @Column(name = "dash_h264", columnDefinition = "TEXT")
    private String dashH264;

    @Column(name = "hls_h264", columnDefinition = "TEXT")
    private String hlsH264;

    private Boolean highlight = false;

    private Short position = 0;
}