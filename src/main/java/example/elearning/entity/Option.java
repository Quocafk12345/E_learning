package example.elearning.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

@Getter
@Setter
@Entity
@Table(name = "options")
public class Option {
    @Id
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "questionId")
    private example.elearning.entity.Question question;

    @Size(max = 200)
    @Nationalized
    @Column(name = "optionText", length = 200)
    private String optionText;

    @Column(name = "optionIndex")
    private Integer optionIndex;

}