package example.elearning.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "Questions")
@Getter
@Setter
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question_text", nullable = false)
    private String text;

    @Column(name = "correct_answer", nullable = false)
    private String correctAnswer;

    @Size(max = 50)
    @Nationalized
    @Column(name = "option_a", length = 50)
    private String optionA;

    @Size(max = 50)
    @Nationalized
    @Column(name = "option_b", length = 50)
    private String optionB;

    @Size(max = 50)
    @Nationalized
    @Column(name = "option_c", length = 50)
    private String optionC;

    @Size(max = 50)
    @Nationalized
    @Column(name = "option_d", length = 50)
    private String optionD;

}