package fr.fullstack.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class GameCompanyId implements Serializable {
    @Column(name = "game_id")
    private Long gameId;

    @Column(name = "company_id")
    private Integer companyId;

    @Column(name = "role", length = 20)
    private String role;
}
