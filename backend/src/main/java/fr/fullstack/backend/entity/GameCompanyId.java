package fr.fullstack.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class GameCompanyId implements Serializable {
    @Column(name = "game_id")
    private Long gameId;

    @Column(name = "company_id")
    private Integer companyId;

    @Column(length = 20)
    private String role;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GameCompanyId that = (GameCompanyId) o;
        return Objects.equals(gameId, that.gameId) &&
                Objects.equals(companyId, that.companyId) &&
                Objects.equals(role, that.role);
    }

    @Override
    public int hashCode() {
        return Objects.hash(gameId, companyId, role);
    }
}