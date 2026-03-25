package fr.fullstack.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "genres")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Genre {
    @Id
    private Integer id;

    @Column(nullable = false, length = 200)
    private String description;
}