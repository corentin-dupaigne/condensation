package fr.fullstack.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "games")
@Getter @Setter @NoArgsConstructor
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "steam_app_id", unique = true, nullable = false)
    private Integer steamAppId;

    @Column(length = 500, nullable = false)
    private String name;

    @Column(length = 500, unique = true, nullable = false)
    private String slug;

    @Column(name = "detailed_description", columnDefinition = "TEXT")
    private String detailedDescription;

    @Column(name = "about_the_game", columnDefinition = "TEXT")
    private String aboutTheGame;

    @Column(name = "supported_languages", columnDefinition = "TEXT")
    private String supportedLanguages;

    @Column(name = "header_image", columnDefinition = "TEXT")
    private String headerImage;

    @Column(name = "required_age")
    private Short requiredAge = 0;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "release_date_raw", length = 100)
    private String releaseDateRaw;

    @Column(name = "metacritic_score")
    private Short metacriticScore;

    @Column(name = "recommendations_total")
    private Integer recommendationsTotal = 0;

    @Column(name = "platform_windows")
    private Boolean platformWindows = false;

    @Column(name = "platform_mac")
    private Boolean platformMac = false;

    @Column(name = "platform_linux")
    private Boolean platformLinux = false;

    @Column(length = 10)
    private String currency;

    @Column(name = "price_initial")
    private Integer priceInitial;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "pc_requirements", columnDefinition = "jsonb")
    private String pcRequirements;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "mac_requirements", columnDefinition = "jsonb")
    private String macRequirements;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "linux_requirements", columnDefinition = "jsonb")
    private String linuxRequirements;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "reduction_percentage")
    private Integer reductionPercentage;

    // --- Relations ManyToMany simples ---

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "game_genres",
            joinColumns = @JoinColumn(name = "game_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private Set<Genre> genres;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "game_categories",
            joinColumns = @JoinColumn(name = "game_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories;


    @OneToMany(mappedBy = "game", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<GameCompany> gameCompanies;

    @OneToMany(mappedBy = "game", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<Screenshot> screenshots;

    @OneToMany(mappedBy = "game", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<Movie> movies;

}