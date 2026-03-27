package fr.fullstack.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "games")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "steam_app_id", unique = true, nullable = false)
    private Integer steamAppId;

    @Column(nullable = false, length = 500)
    private String name;

    @Column(unique = true, nullable = false, length = 500)
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
    private Short requiredAge;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "release_date_raw", length = 100)
    private String releaseDateRaw;

    @Column(name = "metacritic_score")
    private Short metacriticScore;

    @Column(name = "recommendations_total")
    private Integer recommendationsTotal;

    @Column(name = "platform_windows")
    private Boolean platformWindows;

    @Column(name = "platform_mac")
    private Boolean platformMac;

    @Column(name = "platform_linux")
    private Boolean platformLinux;

    @Column(length = 10)
    private String currency;

    @Column(name = "price_initial")
    private Integer priceInitial;

    @Column(name = "price_final")
    private Integer priceFinal;

    @Column(name = "discount_percent")
    private Short discountPercent;

    @Column(name = "pc_requirements", columnDefinition = "jsonb")
    private String pcRequirements;

    @Column(name = "mac_requirements", columnDefinition = "jsonb")
    private String macRequirements;

    @Column(name = "linux_requirements", columnDefinition = "jsonb")
    private String linuxRequirements;

    @Column(name = "reduction_percentage")
    private Integer reductionPercentage;

    @Column(name = "steam_key", length = 17)
    private String steamKey;

    @CreationTimestamp
    @Column(name = "crawled_at", updatable = false)
    private ZonedDateTime crawledAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    @ManyToMany
    @JoinTable(
            name = "game_genres",
            joinColumns = @JoinColumn(name = "game_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    @Builder.Default
    private List<Genre> genres = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "game_categories",
            joinColumns = @JoinColumn(name = "game_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @Builder.Default
    private List<Category> categories = new ArrayList<>();

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Screenshot> screenshots = new ArrayList<>();

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Movie> movies = new ArrayList<>();

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GameCompany> gameCompanies = new ArrayList<>();
}