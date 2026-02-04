const API_BASE = 'http://localhost:8080/api';
const token = localStorage.getItem('token');

if (!token) window.location.href = 'index.html';

// DOM Elements
const introSection = document.getElementById('intro-section');
const progressSection = document.getElementById('progress-section');
const questionsContainer = document.getElementById('questions-container');
const navButtons = document.getElementById('nav-buttons');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const form = document.getElementById('assessment-form');
const resultModal = document.getElementById('result-modal');
const riskDisplay = document.getElementById('risk-display');
const scoreDisplay = document.getElementById('score-display');
const currentQuestionSpan = document.getElementById('current-question');
const totalQuestionsSpan = document.getElementById('total-questions');
const progressPercentageSpan = document.getElementById('progress-percentage');
const progressFill = document.getElementById('progress-fill');

// State
let questions = [];
let answers = {};
let currentQuestionIndex = 0;
let totalQuestions = 0;
let currentRisk = '';

// Start Assessment
window.startAssessment = function () {
    introSection.style.display = 'none';
    progressSection.style.display = 'block';
    navButtons.style.display = 'flex';
    loadQuestions();
}

// Load Questions from API
async function loadQuestions() {
    try {
        const response = await fetch(`${API_BASE}/assessment/questions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        questions = await response.json();
        totalQuestions = questions.length;
        totalQuestionsSpan.textContent = totalQuestions;

        if (questions.length > 0) {
            showQuestion(0);
        }
    } catch (error) {
        console.error('Error loading questions:', error);
        questionsContainer.innerHTML = '<p class="text-danger">Failed to load questions. Please check your connection.</p>';
    }
}

// Show specific question
function showQuestion(index) {
    if (index < 0 || index >= questions.length) return;

    currentQuestionIndex = index;
    const q = questions[index];

    // Update progress
    updateProgress();

    // Render question
    questionsContainer.innerHTML = `
        <div class="question-card">
            <div class="question-number">${index + 1}</div>
            <div class="question-text">${q.text}</div>
            <div class="option-group" id="q-${q.id}">
                <div class="option-btn" onclick="selectOption(${q.id}, 0, this)">
                    <div>Not at all</div>
                    <span class="option-label">Never experienced</span>
                </div>
                <div class="option-btn" onclick="selectOption(${q.id}, 1, this)">
                    <div>Several days</div>
                    <span class="option-label">Occasionally</span>
                </div>
                <div class="option-btn" onclick="selectOption(${q.id}, 2, this)">
                    <div>More than half</div>
                    <span class="option-label">Frequently</span>
                </div>
                <div class="option-btn" onclick="selectOption(${q.id}, 3, this)">
                    <div>Nearly every day</div>
                    <span class="option-label">Almost always</span>
                </div>
            </div>
        </div>
    `;

    // Restore previous answer if exists
    if (answers[q.id] !== undefined) {
        const parent = document.getElementById(`q-${q.id}`);
        const selectedBtn = parent.children[answers[q.id]];
        if (selectedBtn) selectedBtn.classList.add('selected');
    }

    // Update navigation buttons
    updateNavigationButtons();
}

// Update progress indicators
function updateProgress() {
    const current = currentQuestionIndex + 1;
    const percentage = Math.round((current / totalQuestions) * 100);

    currentQuestionSpan.textContent = current;
    progressPercentageSpan.textContent = percentage;
    progressFill.style.width = percentage + '%';
}

// Update navigation button visibility
function updateNavigationButtons() {
    // Show/hide previous button
    prevBtn.style.display = currentQuestionIndex === 0 ? 'none' : 'flex';

    // Show next or submit button
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
    nextBtn.style.display = isLastQuestion ? 'none' : 'flex';
    submitBtn.style.display = isLastQuestion ? 'flex' : 'none';
}

// Select option handler
window.selectOption = function (questionId, value, element) {
    answers[questionId] = value;

    // UI Update
    const parent = element.parentElement;
    Array.from(parent.children).forEach(child => child.classList.remove('selected'));
    element.classList.add('selected');

    // Auto-advance to next question after short delay (optional UX enhancement)
    setTimeout(() => {
        if (currentQuestionIndex < totalQuestions - 1) {
            nextQuestion();
        }
    }, 300);
}

// Navigation functions
window.nextQuestion = function () {
    const currentQuestion = questions[currentQuestionIndex];

    // Check if current question is answered
    if (answers[currentQuestion.id] === undefined) {
        alert('Please select an answer before proceeding.');
        return;
    }

    if (currentQuestionIndex < totalQuestions - 1) {
        showQuestion(currentQuestionIndex + 1);
    }
}

window.previousQuestion = function () {
    if (currentQuestionIndex > 0) {
        showQuestion(currentQuestionIndex - 1);
    }
}

// Submit form
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all questions answered
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < totalQuestions) {
        alert(`Please answer all questions before submitting.\n\nProgress: ${answeredCount}/${totalQuestions} questions answered.`);
        return;
    }

    try {
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        submitBtn.disabled = true;

        const response = await fetch(`${API_BASE}/assessment/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ answers: answers })
        });

        if (response.ok) {
            const result = await response.json();
            showResult(result);
        } else {
            alert('Failed to submit assessment. Please try again.');
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Submit Assessment';
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error submitting assessment:', error);
        alert('Error submitting assessment');
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Submit Assessment';
        submitBtn.disabled = false;
    }
});

// Show result modal
function showResult(result) {
    currentRisk = result.riskLevel;

    scoreDisplay.textContent = result.score || calculateTotalScore();

    // Determine risk class and text
    let riskClass = 'risk-moderate';
    let riskText = 'Moderate Risk';

    if (result.riskLevel === 'LOW' || result.riskLevel === 'low') {
        riskClass = 'risk-low';
        riskText = 'Low Risk';
    } else if (result.riskLevel === 'HIGH' || result.riskLevel === 'high') {
        riskClass = 'risk-high';
        riskText = 'High Risk';
    }

    riskDisplay.className = 'risk-badge ' + riskClass;
    riskDisplay.textContent = riskText;

    resultModal.style.display = 'flex';
}

// Calculate total score from answers
function calculateTotalScore() {
    return Object.values(answers).reduce((sum, val) => sum + val, 0);
}

// Close modal
window.closeModal = function () {
    resultModal.style.display = 'none';
    window.location.href = 'dashboard.html';
}

// Find doctors
window.findDoctors = function () {
    resultModal.style.display = 'none';
    window.location.href = 'find-doctor.html';
}

// Logout
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}
