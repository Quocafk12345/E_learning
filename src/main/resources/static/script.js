const BASE_URL = 'http://localhost:8080/api/quiz';

// Dữ liệu bài kiểm tra - Ban đầu là mảng rỗng, sẽ được điền từ API
let quizData = [];
let attemptId = null; // Lưu ID của lần làm bài

// Trạng thái ứng dụng
const quizState = {
    studentName: "",
    currentQuestionIndex: 0,
    answers: [],
    markedQuestions: new Set(),

    getCurrentQuestion() {
        return quizData[this.currentQuestionIndex];
    },

    isLastQuestion() {
        return this.currentQuestionIndex === quizData.length - 1;
    },

    isFirstQuestion() {
        return this.currentQuestionIndex === 0;
    },

    setAnswer(optionIndex) {
        this.answers[this.currentQuestionIndex] = optionIndex;
    },

    toggleMarked() {
        if (this.markedQuestions.has(this.currentQuestionIndex)) {
            this.markedQuestions.delete(this.currentQuestionIndex);
        } else {
            this.markedQuestions.add(this.currentQuestionIndex);
        }
    },

    isMarked() {
        return this.markedQuestions.has(this.currentQuestionIndex);
    },
};

// DOM Elements
const elements = {
    screens: {
        login: document.getElementById("login-screen"),
        quiz: document.getElementById("quiz-screen"),
        review: document.getElementById("review-screen"),
        confirmation: document.getElementById("confirmation-screen"),
    },
    login: {
        form: document.getElementById("login-form"),
        nameInput: document.getElementById("student-name"),
    },
    quiz: {
        displayName: document.getElementById("display-name"),
        questionCounter: document.getElementById("current-question"),
        totalQuestions: document.getElementById("total-questions"),
        questionText: document.getElementById("question-text"),
        optionsContainer: document.getElementById("options-container"),
        nextButton: document.getElementById("next-button"),
        prevButton: document.getElementById("prev-button"),
        markButton: document.getElementById("mark-button"),
        progressBar: document.getElementById("progress-bar"),
    },
    review: {
        displayName: document.getElementById("review-display-name"),
        markedList: document.getElementById("marked-questions-list"),
        answersSummary: document.getElementById("answers-summary"),
        backButton: document.getElementById("back-to-quiz"),
        submitButton: document.getElementById("submit-quiz"),
    },
    confirmation: {
        summary: document.getElementById("submission-summary"),
        restartButton: document.getElementById("restart-quiz"),
    },
};

// Khởi tạo ứng dụng
function initializeApp() {
    elements.login.form.addEventListener("submit", handleLoginSubmit);
    elements.quiz.nextButton.addEventListener("click", handleNextQuestion);
    elements.quiz.prevButton.addEventListener("click", handlePrevQuestion);
    elements.quiz.markButton.addEventListener("click", handleMarkQuestion);
    elements.review.backButton.addEventListener("click", handleBackToQuiz);
    elements.review.submitButton.addEventListener("click", handleSubmitQuiz);
    elements.confirmation.restartButton.addEventListener("click", handleRestartQuiz);
}

// Hiển thị màn hình
function showScreen(screenId) {
    Object.values(elements.screens).forEach((screen) => {
        screen.classList.remove("active");
    });
    elements.screens[screenId].classList.add("active");
}

// Lấy dữ liệu câu hỏi từ API
async function fetchQuizData() {
    try {
        const response = await fetch(`${BASE_URL}/questions`);
        if (!response.ok) {
            throw new Error(`Lỗi mạng: ${response.status}`);
        }
        quizData = await response.json();
        console.log('Dữ liệu câu hỏi:', quizData);
        elements.quiz.totalQuestions.textContent = quizData.length;
        quizState.answers = Array(quizData.length).fill(null);
    } catch (error) {
        console.error('Lỗi khi lấy câu hỏi:', error);
        alert('Không thể tải câu hỏi. Vui lòng thử lại.');
    }
}

// Bắt đầu bài kiểm tra
async function startQuiz(studentName) {
    try {
        const response = await fetch(`${BASE_URL}/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `studentName=${encodeURIComponent(studentName)}`
        });
        if (!response.ok) {
            throw new Error(`Lỗi mạng: ${response.status}`);
        }
        const attempt = await response.json();
        console.log('Bắt đầu bài kiểm tra:', attempt);
        attemptId = attempt.id; // Lưu attemptId
        return attempt;
    } catch (error) {
        console.error('Lỗi khi bắt đầu bài kiểm tra:', error);
        alert(`Lỗi: ${error.message}`);
    }
}

// Hiển thị câu hỏi
function displayQuestion() {
    if (!quizData || quizData.length === 0) {
        console.error('Không có dữ liệu câu hỏi');
        return;
    }

    const question = quizState.getCurrentQuestion();
    if (!question) {
        console.error('Câu hỏi không tồn tại tại chỉ số:', quizState.currentQuestionIndex);
        return;
    }

    elements.quiz.questionText.textContent = question.text || 'Không có nội dung câu hỏi';
    elements.quiz.questionCounter.textContent = quizState.currentQuestionIndex + 1;

    elements.quiz.optionsContainer.innerHTML = '';
    const options = [question.optionA, question.optionB, question.optionC, question.optionD];
    options.forEach((option, index) => {
        const optionElement = document.createElement('button');
        optionElement.classList.add('option');
        optionElement.textContent = option || `Lựa chọn ${index + 1}`;
        optionElement.dataset.index = index;
        if (quizState.answers[quizState.currentQuestionIndex] === index) {
            optionElement.classList.add('selected');
        }
        optionElement.addEventListener('click', () => {
            document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
            optionElement.classList.add('selected');
            quizState.setAnswer(index);
        });
        elements.quiz.optionsContainer.appendChild(optionElement);
    });

    const progress = ((quizState.currentQuestionIndex + 1) / quizData.length) * 100;
    elements.quiz.progressBar.style.width = `${progress}%`;

    elements.quiz.prevButton.disabled = quizState.isFirstQuestion();
    elements.quiz.nextButton.textContent = quizState.isLastQuestion() ? 'Xem lại' : 'Câu tiếp theo';
    updateMarkButtonText();
}

// Xử lý gửi biểu mẫu đăng nhập
async function handleLoginSubmit(event) {
    event.preventDefault();
    const name = elements.login.nameInput.value.trim();
    if (!name) {
        alert('Vui lòng nhập tên học sinh');
        return;
    }

    quizState.studentName = name;
    elements.quiz.displayName.textContent = name;
    elements.review.displayName.textContent = name;

    await startQuiz(name);
    await fetchQuizData();
    showScreen('quiz');
    displayQuestion();
}

// Xử lý câu tiếp theo
function handleNextQuestion() {
    const selectedOption = document.querySelector('.option.selected');
    if (selectedOption) {
        const optionIndex = parseInt(selectedOption.dataset.index);
        quizState.setAnswer(optionIndex);
    }

    if (quizState.isLastQuestion()) {
        prepareReviewScreen();
        showScreen('review');
    } else {
        quizState.currentQuestionIndex++;
        displayQuestion();
    }
}

// Xử lý câu trước đó
function handlePrevQuestion() {
    const selectedOption = document.querySelector('.option.selected');
    if (selectedOption) {
        const optionIndex = parseInt(selectedOption.dataset.index);
        quizState.setAnswer(optionIndex);
    }

    if (!quizState.isFirstQuestion()) {
        quizState.currentQuestionIndex--;
        displayQuestion();
    }
}

// Xử lý đánh dấu câu hỏi
function handleMarkQuestion() {
    quizState.toggleMarked();
    updateMarkButtonText();
}

// Cập nhật văn bản nút đánh dấu
function updateMarkButtonText() {
    elements.quiz.markButton.textContent = quizState.isMarked() ? 'Bỏ đánh dấu' : 'Đánh dấu';
}

// Chuẩn bị màn hình xem lại
function prepareReviewScreen() {
    elements.review.markedList.innerHTML = '';
    elements.review.answersSummary.innerHTML = '';

    if (quizState.markedQuestions.size === 0) {
        elements.review.markedList.innerHTML = '<li>Không có câu hỏi nào được đánh dấu</li>';
    } else {
        Array.from(quizState.markedQuestions)
            .sort((a, b) => a - b)
            .forEach(index => {
                const li = document.createElement('li');
                li.textContent = `Câu ${index + 1}: ${quizData[index].text}`;
                li.addEventListener('click', () => {
                    quizState.currentQuestionIndex = index;
                    displayQuestion();
                    showScreen('quiz');
                });
                elements.review.markedList.appendChild(li);
            });
    }

    quizData.forEach((question, index) => {
        const answerDiv = document.createElement('div');
        answerDiv.classList.add('question-review');
        const heading = document.createElement('h4');
        heading.textContent = `Câu ${index + 1}: ${question.text}`;
        if (quizState.markedQuestions.has(index)) {
            const markedBadge = document.createElement('span');
            markedBadge.classList.add('marked-badge');
            markedBadge.textContent = 'Đã đánh dấu';
            heading.appendChild(markedBadge);
        }
        answerDiv.appendChild(heading);

        const answerText = document.createElement('p');
        const answerIndex = quizState.answers[index];
        const options = [question.optionA, question.optionB, question.optionC, question.optionD];
        if (answerIndex !== null && answerIndex !== undefined) {
            answerText.textContent = `Câu trả lời của bạn: ${options[answerIndex]}`;
        } else {
            answerText.textContent = 'Chưa trả lời';
            answerText.style.color = '#e74c3c';
        }
        answerDiv.appendChild(answerText);

        answerDiv.addEventListener('click', () => {
            quizState.currentQuestionIndex = index;
            displayQuestion();
            showScreen('quiz');
        });

        elements.review.answersSummary.appendChild(answerDiv);
    });
}

// Xử lý gửi bài kiểm tra
async function handleSubmitQuiz() {
    const selectedOption = document.querySelector('.option.selected');
    if (selectedOption) {
        const optionIndex = parseInt(selectedOption.dataset.index);
        quizState.setAnswer(optionIndex);
    }

    // Tính điểm
    let correctCount = 0;
    let answeredCount = 0;
    quizData.forEach((question, index) => {
        const answerIndex = quizState.answers[index];
        if (answerIndex !== null && answerIndex !== undefined) {
            answeredCount++;
            const selectedOption = ['A', 'B', 'C', 'D'][answerIndex];
            if (selectedOption === question.correctAnswer) {
                correctCount++;
            }
        }
    });

    const totalQuestions = quizData.length;
    const scorePercentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    // Chuẩn bị dữ liệu câu trả lời gửi lên API
    const answers = quizData.map((question, index) => ({
        question: { id: question.id },
        selectedOption: quizState.answers[index] !== null ? ['A', 'B', 'C', 'D'][quizState.answers[index]] : null
    }));

    if (!attemptId) {
        alert('Không tìm thấy ID lần làm bài. Vui lòng bắt đầu lại.');
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/submit/${attemptId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(answers)
        });
        if (!response.ok) {
            throw new Error(`Lỗi mạng: ${response.status}`);
        }
        const attempt = await response.json();
        elements.confirmation.summary.innerHTML = `
            <p><strong>Học sinh:</strong> ${quizState.studentName}</p>
            <p><strong>Số câu đúng:</strong> ${correctCount}/${totalQuestions}</p>
            <p><strong>Số câu đã trả lời:</strong> ${answeredCount}/${totalQuestions}</p>
            <p><strong>Điểm số:</strong> ${scorePercentage.toFixed(1)}%</p>
            <p><strong>Thời gian kết thúc:</strong> ${attempt.endTime}</p>
        `;
        showScreen('confirmation');
    } catch (error) {
        console.error('Lỗi khi gửi bài kiểm tra:', error);
        alert(`Lỗi: ${error.message}`);
    }
}

// Xử lý quay lại
function handleBackToQuiz() {
    showScreen('quiz');
    displayQuestion();
}

// Xử lý bắt đầu lại
function handleRestartQuiz() {
    quizState.currentQuestionIndex = 0;
    quizState.answers = Array(quizData.length).fill(null);
    quizState.markedQuestions = new Set();
    attemptId = null;
    showScreen('login');
    elements.login.nameInput.value = '';
}

// Khởi tạo ứng dụng
document.addEventListener('DOMContentLoaded', initializeApp);