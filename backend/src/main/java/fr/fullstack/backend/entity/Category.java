package fr.fullstack.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {
    @Id
    private Integer id;

    @Column(nullable = false, length = 200)
    private String description;
}