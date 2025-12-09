// CGF Security Quiz - Main Application Logic
class SecurityQuiz {
    constructor() {
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.startTime = null;
        this.userName = '';
        this.timer = null;
        this.results = [];
        
        this.initializeApp();
    }

    initializeApp() {
        this.loadResults();
        this.setupEventListeners();
        this.showScreen('welcome-screen');
    }

    setupEventListeners() {
        // Welcome screen
        document.getElementById('startQuiz').addEventListener('click', () => this.startQuiz());
        
        // Quiz navigation
        document.getElementById('nextBtn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('prevBtn').addEventListener('click', () => this.previousQuestion());
        
        // Results screen
        document.getElementById('retakeBtn').addEventListener('click', () => this.retakeQuiz());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportResults());
        document.getElementById('viewAllResults').addEventListener('click', () => this.showAllResults());
        
        // Admin panel
        document.getElementById('adminToggle').addEventListener('click', () => this.toggleAdmin());
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // User name input
        document.getElementById('userName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.startQuiz();
        });
    }

    generateRandomQuiz() {
        const quiz = [];
        
        quizConfig.categories.forEach(category => {
            const categoryQuestions = questionBank[category];
            const selectedQuestions = this.getRandomQuestions(categoryQuestions, quizConfig.questionsPerCategory);
            quiz.push(...selectedQuestions.map(q => ({...q, category})));
        });
        
        // Shuffle the entire quiz
        return this.shuffleArray(quiz);
    }

    getRandomQuestions(questions, count) {
        const shuffled = this.shuffleArray([...questions]);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    startQuiz() {
        const nameInput = document.getElementById('userName');
        this.userName = nameInput.value.trim();
        
        if (!this.userName) {
            this.showMessage('Please enter your name to start the quiz.', 'error');
            nameInput.focus();
            return;
        }

        this.currentQuiz = this.generateRandomQuiz();
        this.currentQuestionIndex = 0;
        this.userAnswers = new Array(this.currentQuiz.length).fill(null);
        this.startTime = new Date();
        
        this.showScreen('quiz-screen');
        this.startTimer();
        this.displayQuestion();
        this.updateProgress();
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        
        this.timer = setInterval(() => {
            const elapsed = new Date() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            document.getElementById('timer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    displayQuestion() {
        const question = this.currentQuiz[this.currentQuestionIndex];
        const questionNumber = this.currentQuestionIndex + 1;
        const totalQuestions = this.currentQuiz.length;
        
        // Update question info
        document.getElementById('currentQ').textContent = questionNumber;
        document.getElementById('totalQ').textContent = totalQuestions;
        document.getElementById('currentCategory').textContent = question.category;
        document.getElementById('questionText').textContent = question.question;
        
        // Create options
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.innerHTML = `
                <input type="radio" name="answer" value="${index}" id="option${index}">
                <label for="option${index}">${option}</label>
            `;
            
            // Check if this option was previously selected
            if (this.userAnswers[this.currentQuestionIndex] === index) {
                optionDiv.querySelector('input').checked = true;
                optionDiv.classList.add('selected');
            }
            
            // Add click handler
            optionDiv.addEventListener('click', () => this.selectOption(index));
            
            optionsContainer.appendChild(optionDiv);
        });
        
        this.updateNavigationButtons();
    }

    selectOption(optionIndex) {
        // Clear previous selection
        document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
        
        // Mark new selection
        const selectedOption = document.querySelector(`#option${optionIndex}`).closest('.option');
        selectedOption.classList.add('selected');
        document.querySelector(`#option${optionIndex}`).checked = true;
        
        // Store answer
        this.userAnswers[this.currentQuestionIndex] = optionIndex;
        
        // Enable next button
        document.getElementById('nextBtn').disabled = false;
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        prevBtn.disabled = this.currentQuestionIndex === 0;
        
        const hasAnswer = this.userAnswers[this.currentQuestionIndex] !== null;
        nextBtn.disabled = !hasAnswer;
        
        // Update next button text
        if (this.currentQuestionIndex === this.currentQuiz.length - 1) {
            nextBtn.textContent = 'Finish Quiz';
        } else {
            nextBtn.textContent = 'Next';
        }
    }

    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.currentQuiz.length) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuiz.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
            this.updateProgress();
        } else {
            this.finishQuiz();
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
            this.updateProgress();
        }
    }

    finishQuiz() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        const endTime = new Date();
        const duration = Math.round((endTime - this.startTime) / 1000); // in seconds
        
        const results = this.calculateResults(duration);
        this.saveResults(results);
        this.displayResults(results);
        this.showScreen('results-screen');
    }

    calculateResults(duration) {
        const categoryScores = {};
        const categoryTotals = {};
        
        // Initialize category counters
        quizConfig.categories.forEach(cat => {
            categoryScores[cat] = 0;
            categoryTotals[cat] = 0;
        });
        
        let totalCorrect = 0;
        const detailedAnswers = [];
        
        this.currentQuiz.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            const isCorrect = userAnswer === question.correct;
            
            if (isCorrect) {
                totalCorrect++;
                categoryScores[question.category]++;
            }
            categoryTotals[question.category]++;
            
            detailedAnswers.push({
                question: question.question,
                category: question.category,
                userAnswer: userAnswer !== null ? question.options[userAnswer] : 'No answer',
                correctAnswer: question.options[question.correct],
                isCorrect: isCorrect,
                explanation: question.explanation
            });
        });
        
        const overallScore = Math.round((totalCorrect / this.currentQuiz.length) * 100);
        const passed = overallScore >= quizConfig.passingScore;
        
        return {
            userName: this.userName,
            date: new Date().toISOString(),
            duration: duration,
            overallScore: overallScore,
            totalCorrect: totalCorrect,
            totalQuestions: this.currentQuiz.length,
            passed: passed,
            categoryScores: categoryScores,
            categoryTotals: categoryTotals,
            detailedAnswers: detailedAnswers
        };
    }

    displayResults(results) {
        // Overall score
        document.getElementById('overallScore').textContent = `${results.overallScore}%`;
        
        // Category results
        const categoryContainer = document.getElementById('categoryResults');
        categoryContainer.innerHTML = '';
        
        Object.keys(results.categoryScores).forEach(category => {
            const score = results.categoryScores[category];
            const total = results.categoryTotals[category];
            const percentage = Math.round((score / total) * 100);
            
            const categoryDiv = document.createElement('div');
            categoryDiv.className = `category-result ${this.getPerformanceClass(percentage)}`;
            categoryDiv.innerHTML = `
                <div class="category-name">${category}</div>
                <div class="category-score">${percentage}%</div>
                <div class="category-details">${score}/${total} correct</div>
            `;
            
            categoryContainer.appendChild(categoryDiv);
        });
        
        // Show success/failure message
        const message = results.passed ? 
            `🎉 Congratulations! You passed with ${results.overallScore}%` :
            `📚 You scored ${results.overallScore}%. Keep studying and try again!`;
        
        this.showMessage(message, results.passed ? 'success' : 'info');
    }

    getPerformanceClass(percentage) {
        if (percentage >= 85) return 'excellent';
        if (percentage >= 70) return 'good';
        return 'poor';
    }

    saveResults(results) {
        this.results.push(results);
        localStorage.setItem('cgf-quiz-results', JSON.stringify(this.results));
    }

    loadResults() {
        const saved = localStorage.getItem('cgf-quiz-results');
        this.results = saved ? JSON.parse(saved) : [];
    }

    retakeQuiz() {
        this.showScreen('welcome-screen');
        document.getElementById('userName').value = this.userName;
    }

    exportResults() {
        if (this.results.length === 0) {
            this.showMessage('No results to export.', 'info');
            return;
        }
        
        const csv = this.convertToCSV(this.results);
        this.downloadCSV(csv, 'cgf-quiz-results.csv');
    }

    convertToCSV(data) {
        const headers = ['Name', 'Date', 'Overall Score', 'Passed', 'Duration (seconds)', 'Physical Security', 'Access Control', 'Data Protection', 'Incident Response'];
        
        const rows = data.map(result => [
            result.userName,
            new Date(result.date).toLocaleString(),
            `${result.overallScore}%`,
            result.passed ? 'Yes' : 'No',
            result.duration,
            `${Math.round((result.categoryScores['Physical Security'] / result.categoryTotals['Physical Security']) * 100)}%`,
            `${Math.round((result.categoryScores['Access Control'] / result.categoryTotals['Access Control']) * 100)}%`,
            `${Math.round((result.categoryScores['Data Protection'] / result.categoryTotals['Data Protection']) * 100)}%`,
            `${Math.round((result.categoryScores['Incident Response'] / result.categoryTotals['Incident Response']) * 100)}%`
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    showMessage(text, type) {
        // Remove existing messages
        document.querySelectorAll('.message').forEach(msg => msg.remove());
        
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        const container = document.querySelector('.screen.active .welcome-card, .screen.active .results-card');
        if (container) {
            container.insertBefore(message, container.firstChild);
            
            // Auto-remove after 5 seconds
            setTimeout(() => message.remove(), 5000);
        }
    }

    toggleAdmin() {
        const adminScreen = document.getElementById('admin-screen');
        if (adminScreen.classList.contains('active')) {
            this.showScreen('welcome-screen');
        } else {
            this.showScreen('admin-screen');
            this.loadAdminData();
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Load tab-specific data
        if (tabName === 'results') this.loadAllResults();
        if (tabName === 'analytics') this.loadAnalytics();
        if (tabName === 'questions') this.loadQuestions();
    }

    loadAdminData() {
        this.loadQuestions();
        this.loadAllResults();
        this.loadAnalytics();
    }

    loadQuestions() {
        const container = document.getElementById('questionsList');
        container.innerHTML = '<h4>Question Bank Overview</h4>';
        
        Object.keys(questionBank).forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.innerHTML = `
                <h5>${category} (${questionBank[category].length} questions)</h5>
                <div style="margin-left: 20px;">
                    ${questionBank[category].map((q, i) => `
                        <div style="margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                            <strong>Q${i+1}:</strong> ${q.question}
                        </div>
                    `).join('')}
                </div>
            `;
            container.appendChild(categoryDiv);
        });
    }

    loadAllResults() {
        const container = document.getElementById('allResultsList');
        
        if (this.results.length === 0) {
            container.innerHTML = '<p>No quiz results yet.</p>';
            return;
        }
        
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        
        table.innerHTML = `
            <thead>
                <tr style="background: #f8f9fa;">
                    <th style="padding: 10px; border: 1px solid #ddd;">Name</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Date</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Score</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Status</th>
                </tr>
            </thead>
            <tbody>
                ${this.results.map(result => `
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;">${result.userName}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${new Date(result.date).toLocaleString()}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${result.overallScore}%</td>
                        <td style="padding: 10px; border: 1px solid #ddd; color: ${result.passed ? 'green' : 'red'};">
                            ${result.passed ? '✅ PASS' : '❌ FAIL'}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        
        container.innerHTML = '';
        container.appendChild(table);
    }

    loadAnalytics() {
        const container = document.getElementById('analyticsContent');
        
        if (this.results.length === 0) {
            container.innerHTML = '<p>No data available for analytics.</p>';
            return;
        }
        
        const totalAttempts = this.results.length;
        const averageScore = Math.round(this.results.reduce((sum, r) => sum + r.overallScore, 0) / totalAttempts);
        const passRate = Math.round((this.results.filter(r => r.passed).length / totalAttempts) * 100);
        
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; text-align: center;">
                    <h3>${totalAttempts}</h3>
                    <p>Total Attempts</p>
                </div>
                <div style="background: #e8f5e9; padding: 20px; border-radius: 10px; text-align: center;">
                    <h3>${averageScore}%</h3>
                    <p>Average Score</p>
                </div>
                <div style="background: #fff3e0; padding: 20px; border-radius: 10px; text-align: center;">
                    <h3>${passRate}%</h3>
                    <p>Pass Rate</p>
                </div>
            </div>
            
            <h4>Category Performance</h4>
            <div id="categoryAnalytics"></div>
        `;
        
        this.loadCategoryAnalytics();
    }

    loadCategoryAnalytics() {
        const container = document.getElementById('categoryAnalytics');
        const categoryStats = {};
        
        // Initialize categories
        quizConfig.categories.forEach(cat => {
            categoryStats[cat] = { total: 0, correct: 0, attempts: 0 };
        });
        
        // Calculate category statistics
        this.results.forEach(result => {
            Object.keys(result.categoryScores).forEach(category => {
                categoryStats[category].correct += result.categoryScores[category];
                categoryStats[category].total += result.categoryTotals[category];
                categoryStats[category].attempts++;
            });
        });
        
        // Display category statistics
        const categoryHTML = Object.keys(categoryStats).map(category => {
            const stats = categoryStats[category];
            const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
            
            return `
                <div style="background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea;">
                    <h5>${category}</h5>
                    <p>Average Score: ${percentage}% (${stats.correct}/${stats.total} correct)</p>
                    <p>Attempts: ${stats.attempts}</p>
                </div>
            `;
        }).join('');
        
        container.innerHTML = categoryHTML;
    }

    showAllResults() {
        this.showScreen('admin-screen');
        this.switchTab('results');
    }
}

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SecurityQuiz();
});
