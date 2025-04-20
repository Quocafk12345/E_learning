package example.elearning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuizResultDTO {
    private Integer totalQuestion;
    private Integer totalAnswerQuestion;
    private String studentName;
    private int answeredQuestion;
    private int correctAnswer;
    private double score;
}
