package fr.fullstack.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity
@Table(name = "game_companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameCompany {

    @EmbeddedId
    private GameCompanyId id = new GameCompanyId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("gameId")
    @JoinColumn(name = "game_id")
    private Game game;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("companyId")
    @JoinColumn(name = "company_id")
    private Company company;

    public String getRole() {
        return id != null ? id.getRole() : null;
    }
}