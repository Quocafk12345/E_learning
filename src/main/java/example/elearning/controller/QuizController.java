package example.elearning.controller;

import example.elearning.entity.Attempt;
import example.elearning.entity.Question;
import example.elearning.entity.Answer;
import example.elearning.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @PostMapping("/start")
    public Attempt startQuiz(@RequestParam String studentName) {
        return quizService.createStudentAndAttempt(studentName);
    }

    @GetMapping("/questions")
    public List<Question> getQuestions() {
        return quizService.getQuestions();
    }

    @PostMapping("/submit/{attemptId}")
    public Attempt submitQuiz(@PathVariable Long attemptId, @RequestBody List<Answer> answers) {
        return quizService.submitQuiz(attemptId, answers);
    }
}