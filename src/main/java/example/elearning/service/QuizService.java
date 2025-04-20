package example.elearning.service;

import example.elearning.entity.*;
import example.elearning.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class QuizService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AttemptRepository attemptRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private AnswerRepository answerRepository;

    public Attempt createStudentAndAttempt(String studentName) {
        Student student = new Student();
        student.setName(studentName);
        student = studentRepository.save(student);

        Attempt attempt = new Attempt();
        attempt.setStudent(student);
        attempt.setStartTime(LocalDateTime.now());
        return attemptRepository.save(attempt);
    }

    public List<Question> getQuestions() {
        return questionRepository.findAll();
    }

    @Transactional
    public Attempt submitQuiz(Long attemptId, List<Answer> answers) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        // Xóa các câu trả lời cũ (nếu có) để tránh xung đột
        answerRepository.deleteByAttemptId(attemptId);

        // Lưu các câu trả lời mới
        for (Answer answer : answers) {
            Answer newAnswer = new Answer(); // Tạo Answer mới để tránh ID không hợp lệ
            newAnswer.setAttempt(attempt);
            newAnswer.setQuestion(questionRepository.findById(answer.getQuestion().getId())
                    .orElseThrow(() -> new RuntimeException("Question not found")));
            newAnswer.setSelectedOption(answer.getSelectedOption());
            newAnswer.setIsMarked(false); // Mặc định không đánh dấu
            answerRepository.save(newAnswer);
        }

        // Tính điểm
        double score = calculateScore(answers);

        // Cập nhật điểm và thời gian kết thúc
        attempt.setScore(score);
        attempt.setEndTime(LocalDateTime.now());
        return attemptRepository.save(attempt);
    }

    private double calculateScore(List<Answer> answers) {
        if (answers == null || answers.isEmpty()) {
            return 0.0;
        }

        double totalQuestions = answers.size();
        double correctCount = answers.stream()
                .filter(answer -> {
                    Question question = questionRepository.findById(answer.getQuestion().getId())
                            .orElse(null);
                    String selected = answer.getSelectedOption();
                    return question != null && selected != null && selected.equals(question.getCorrectAnswer());
                })
                .count();
        return (correctCount / totalQuestions) * 100; // Trả về phần trăm
    }
}