package example.elearning.repository;

import example.elearning.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {

    @Modifying
    @Query("DELETE FROM Answer a WHERE a.attempt.id = :attemptId")
    void deleteByAttemptId(Long attemptId);
}