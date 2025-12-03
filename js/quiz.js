// GitHub Gist Configuration
const GIST_CONFIG = {
    token: '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', // Replace with your token from Step 2
    gistId: '81b5e55365cd455cd60148740a8d0935',     // Replace with your gist ID from Step 3
    filename: 'cgf-quiz-data.json'
};

// GitHub API Helper Class
class GistAPI {
    constructor() {
        this.baseURL = 'https://api.github.com/gists';
    }

    async loadData() {
        try {
            const response = await fetch(`${this.baseURL}/${GIST_CONFIG.gistId}`);
            const gist = await response.json();
            const content = gist.files[GIST_CONFIG.filename].content;
            return JSON.parse(content);
        } catch (error) {
            console.error('Error loading from Gist:', error);
            return [];
        }
    }

    async saveData(data) {
        try {
            const response = await fetch(`${this.baseURL}/${GIST_CONFIG.gistId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${GIST_CONFIG.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    files: {
                        [GIST_CONFIG.filename]: {
                            content: JSON.stringify(data, null, 2)
                        }
                    }
                })
            });
            
            if (response.ok) {
                return { success: true };
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Error saving to Gist:', error);
            return { success: false, error: error.message };
        }
    }
}

// CGF Security Quiz - Main Application Logic
class SecurityQuizApp {
    constructor() {
        this.currentUser = null;
        this.currentAdmin = null;
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.startTime = null;
        this.timer = null;
        this.results = [];
        this.currentInterface = 'login';
        this.gistAPI = new GistAPI();
        
        this.initializeApp();
    }

    async initializeApp() {
        await this.loadResults();
        this.setupEventListeners();
        this.showScreen('login-screen');
    }

    setupEventListeners() {
        // Login functionality
        document.querySelectorAll('.login-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchLoginTab(e.target.dataset.role));
        });
        
        document.getElementById('userLoginBtn').addEventListener('click', () => this.userLogin());
        document.getElementById('adminLoginBtn').addEventListener('click', () => this.adminLogin());
        
        // User interface
        document.getElementById('userLogout').addEventListener('click', () => this.logout());
        document.getElementById('startQuiz').addEventListener('click', () => this.startQuiz());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('prevBtn').addEventListener('click', () => this.previousQuestion());
        document.getElementById('retakeBtn').addEventListener('click', () => this.retakeQuiz());
        document.getElementById('exportUserBtn').addEventListener('click', () => this.exportUserResults());
        document.getElementById('submitResults').addEventListener('click', () => this.submitResults());
        
        // Admin interface
        document.getElementById('adminLogout').addEventListener('click', () => this.logout());
        
        // Admin tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchAdminTab(e.target.dataset.tab));
        });
        
        // Admin actions
        document.getElementById('exportAllResults').addEventListener('click', () => this.exportAllResults());
        document.getElementById('clearAllResults').addEventListener('click', () => this.clearAllResults());
        document.getElementById('addQuestionBtn').addEventListener('click', () => this.showAddQuestionModal());
        document.getElementById('addCategoryBtn').addEventListener('click', () => this.showAddCategoryModal());
        document.getElementById('exportUserRankings').addEventListener('click', () => this.exportUserRankings());
        
        // Modal functionality
        this.setupModalEventListeners();
        
        // Search and filter functionality
        this.setupSearchAndFilters();
        
        // Enter key support
        document.getElementById('userFullName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.userLogin();
        });
        document.getElementById('adminPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.adminLogin();
        });
    }

    setupModalEventListeners() {
        // Question modal
        document.getElementById('closeQuestionModal').addEventListener('click', () => this.hideModal('addQuestionModal'));
        document.getElementById('cancelAddQuestion').addEventListener('click', () => this.hideModal('addQuestionModal'));
        document.getElementById('addQuestionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewQuestion();
        });
        
        // Category modal
        document.getElementById('closeCategoryModal').addEventListener('click', () => this.hideModal('addCategoryModal'));
        document.getElementById('cancelAddCategory').addEventListener('click', () => this.hideModal('addCategoryModal'));
        document.getElementById('addCategoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewCategory();
        });
        
        // Edit modal
        document.getElementById('closeEditModal').addEventListener('click', () => this.hideModal('editQuestionModal'));
        document.getElementById('cancelEdit').addEventListener('click', () => this.hideModal('editQuestionModal'));
        document.getElementById('editQuestionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateQuestion();
        });
    }

    setupSearchAndFilters() {
        document.getElementById('searchResults').addEventListener('input', () => this.filterResults());
        document.getElementById('filterStatus').addEventListener('change', () => this.filterResults());
        document.getElementById('sortResults').addEventListener('change', () => this.filterResults());
        document.getElementById('searchQuestions').addEventListener('input', () => this.filterQuestions());
        document.getElementById('filterCategory').addEventListener('change', () => this.filterQuestions());
    }

    // Login System
    switchLoginTab(role) {
        document.querySelectorAll('.login-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.login-form').forEach(form => form.classList.remove('active'));
        
        document.querySelector(`[data-role="${role}"]`).classList.add('active');
        document.getElementById(`${role}-login`).classList.add('active');
    }

    userLogin() {
        const name = document.getElementById('userFullName').value.trim();
        
        if (!name) {
            this.showMessage('Please enter your name.', 'error');
            return;
        }
        
        this.currentUser = {
            name: name,
            department: document.getElementById('userDepartment').value.trim() || 'Not specified',
            loginTime: new Date().toISOString()
        };
        
        document.getElementById('currentUserName').textContent = name;
        this.showInterface('user');
        this.loadWelcomeScreen();
    }

    adminLogin() {
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value.trim();
        
        // Hardcoded credentials for reliability
        const ADMIN_USERNAME = "axchibobAD";
        const ADMIN_PASSWORD = "admin123";
        
        console.log('Admin login attempt:', { username, password });
        
        if (!username || !password) {
            this.showMessage('Please enter both username and password.', 'error');
            return;
        }
        
        if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
            this.showMessage('Invalid admin credentials. Please check your username and password.', 'error');
            return;
        }
        
        this.currentAdmin = {
            username: username,
            loginTime: new Date().toISOString()
        };
        
        document.getElementById('currentAdminName').textContent = username;
        this.showInterface('admin');
        this.loadAdminDashboard();
        this.showMessage('Welcome to Admin Dashboard!', 'success');
    }

    logout() {
        this.currentUser = null;
        this.currentAdmin = null;
        this.currentQuiz = null;
        
        // Clear forms
        document.getElementById('userFullName').value = '';
        document.getElementById('userDepartment').value = '';
        document.getElementById('adminUsername').value = '';
        document.getElementById('adminPassword').value = '';
        
        this.showInterface('login');
    }

    // Interface Management
    showInterface(interfaceType) {
        document.querySelectorAll('.interface').forEach(iface => iface.classList.remove('active'));
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        
        if (interfaceType === 'login') {
            document.getElementById('login-screen').classList.add('active');
        } else if (interfaceType === 'user') {
            document.getElementById('user-interface').classList.add('active');
            document.getElementById('welcome-screen').classList.add('active');
        } else if (interfaceType === 'admin') {
            document.getElementById('admin-interface').classList.add('active');
        }
        
        this.currentInterface = interfaceType;
    }

    showScreen(screenId) {
        if (this.currentInterface === 'user') {
            document.querySelectorAll('#user-interface .screen').forEach(screen => {
                screen.classList.remove('active');
            });
            document.getElementById(screenId).classList.add('active');
        }
    }

    // User Quiz Functionality
    loadWelcomeScreen() {
        const categoryList = document.getElementById('categoryList');
        categoryList.innerHTML = '';
        
        quizConfig.categories.forEach(category => {
            const li = document.createElement('li');
            li.textContent = `${category} (${questionBank[category].length} questions available)`;
            categoryList.appendChild(li);
        });
    }

    generateRandomQuiz() {
        const quiz = [];
        
        quizConfig.categories.forEach(category => {
            const categoryQuestions = questionBank[category];
            if (categoryQuestions.length < quizConfig.questionsPerCategory) {
                throw new Error(`Not enough questions in ${category}. Need ${quizConfig.questionsPerCategory}, have ${categoryQuestions.length}`);
            }
            
            const selectedQuestions = this.getRandomQuestions(categoryQuestions, quizConfig.questionsPerCategory);
            quiz.push(...selectedQuestions.map(q => ({...q, category})));
        });
        
        return this.shuffleArray(quiz);
    }

    getRandomQuestions(questions, count) {
        const shuffled = this.shuffleArray([...questions]);
        return shuffled.slice(0, count);
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
        try {
            this.currentQuiz = this.generateRandomQuiz();
            this.currentQuestionIndex = 0;
            this.userAnswers = new Array(this.currentQuiz.length).fill(null);
            this.startTime = new Date();
            
            this.showScreen('quiz-screen');
            this.startTimer();
            this.displayQuestion();
            this.updateProgress();
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
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
        
        document.getElementById('currentQ').textContent = questionNumber;
        document.getElementById('totalQ').textContent = totalQuestions;
        document.getElementById('currentCategory').textContent = question.category;
        document.getElementById('questionText').textContent = question.question;
        
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.innerHTML = `
                <input type="radio" name="answer" value="${index}" id="option${index}">
                <label for="option${index}">${option}</label>
            `;
            
            if (this.userAnswers[this.currentQuestionIndex] === index) {
                optionDiv.querySelector('input').checked = true;
                optionDiv.classList.add('selected');
            }
            
            optionDiv.addEventListener('click', () => this.selectOption(index));
            optionsContainer.appendChild(optionDiv);
        });
        
        this.updateNavigationButtons();
    }

    selectOption(optionIndex) {
        document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
        
        const selectedOption = document.querySelector(`#option${optionIndex}`).closest('.option');
        selectedOption.classList.add('selected');
        document.querySelector(`#option${optionIndex}`).checked = true;
        
        this.userAnswers[this.currentQuestionIndex] = optionIndex;
        document.getElementById('nextBtn').disabled = false;
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        prevBtn.disabled = this.currentQuestionIndex === 0;
        
        const hasAnswer = this.userAnswers[this.currentQuestionIndex] !== null;
        nextBtn.disabled = !hasAnswer;
        
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
        if (this.timer) clearInterval(this.timer);
        
        const endTime = new Date();
        const duration = Math.round((endTime - this.startTime) / 1000);
        
        const results = this.calculateResults(duration);
        this.displayResults(results);
        this.showScreen('results-screen');
    }

    calculateResults(duration) {
        const categoryScores = {};
        const categoryTotals = {};
        
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
            id: `result_${Date.now()}`,
            userName: this.currentUser.name,
            userDepartment: this.currentUser.department,
            date: new Date().toISOString(),
            duration: duration,
            overallScore: overallScore,
            totalCorrect: totalCorrect,
            totalQuestions: this.currentQuiz.length,
            passed: passed,
            categoryScores: categoryScores,
            categoryTotals: categoryTotals,
            detailedAnswers: detailedAnswers,
            submitted: false
        };
    }

    displayResults(results) {
        this.currentResults = results;
        
        document.getElementById('overallScore').textContent = `${results.overallScore}%`;
        document.getElementById('scoreStatus').textContent = results.passed ? 'PASS' : 'FAIL';
        
        const scoreCard = document.getElementById('overallScoreCard');
        scoreCard.className = `overall-score ${results.passed ? 'pass' : 'fail'}`;
        
        document.getElementById('resultsTitle').textContent = 
            results.passed ? '🎉 Congratulations! You Passed!' : '📚 Keep Studying - You Can Do Better!';
        
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
    }

    getPerformanceClass(percentage) {
        if (percentage >= 85) return 'excellent';
        if (percentage >= 70) return 'good';
        return 'poor';
    }

    async submitResults() {
        if (!this.currentResults) return;
        
        this.currentResults.submitted = true;
        this.currentResults.submittedAt = new Date().toISOString();
        
        // Add to results array
        this.results.push(this.currentResults);
        
        // Save to both local and cloud
        await this.saveResults();
        
        this.showMessage('Results submitted successfully! Thank you for taking the assessment.', 'success');
        
        document.getElementById('submitResults').disabled = true;
        document.getElementById('submitResults').textContent = 'Results Submitted';
    }

    retakeQuiz() {
        this.showScreen('welcome-screen');
    }

    exportUserResults() {
        if (!this.currentResults) return;
        
        const csv = this.convertResultToCSV([this.currentResults]);
        this.downloadCSV(csv, `${this.currentUser.name.replace(/\s+/g, '_')}_quiz_results.csv`);
    }

    // Admin Functionality
    loadAdminDashboard() {
        this.updateDashboardStats();
        this.loadCategoryRanking();
        this.loadTopPerformers();
        this.loadRecentSubmissions();
        this.loadLowPerformers();
    }

    switchAdminTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        switch(tabName) {
            case 'dashboard':
                this.loadAdminDashboard();
                break;
            case 'results':
                this.loadAllResults();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            case 'questions':
                this.loadQuestions();
                break;
            case 'categories':
                this.loadCategories();
                break;
            case 'users':
                this.loadUserRankings();
                break;
        }
    }

    updateDashboardStats() {
        const submittedResults = this.results.filter(r => r.submitted);
        const totalUsers = new Set(submittedResults.map(r => r.userName)).size;
        const totalAttempts = submittedResults.length;
        const avgScore = totalAttempts > 0 ? Math.round(submittedResults.reduce((sum, r) => sum + r.overallScore, 0) / totalAttempts) : 0;
        const passRate = totalAttempts > 0 ? Math.round((submittedResults.filter(r => r.passed).length / totalAttempts) * 100) : 0;
        
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('totalAttempts').textContent = totalAttempts;
        document.getElementById('avgScore').textContent = `${avgScore}%`;
        document.getElementById('passRate').textContent = `${passRate}%`;
    }

    loadCategoryRanking() {
        const submittedResults = this.results.filter(r => r.submitted);
        if (submittedResults.length === 0) {
            document.getElementById('categoryRanking').innerHTML = '<p>No data available</p>';
            return;
        }
        
        const categoryStats = {};
        
        quizConfig.categories.forEach(cat => {
            categoryStats[cat] = { correct: 0, total: 0 };
        });
        
        submittedResults.forEach(result => {
            Object.keys(result.categoryScores).forEach(category => {
                if (categoryStats[category]) {
                    categoryStats[category].correct += result.categoryScores[category];
                    categoryStats[category].total += result.categoryTotals[category];
                }
            });
        });
        
        const rankings = Object.keys(categoryStats)
            .map(category => ({
                category,
                percentage: categoryStats[category].total > 0 ? 
                    Math.round((categoryStats[category].correct / categoryStats[category].total) * 100) : 0,
                correct: categoryStats[category].correct,
                total: categoryStats[category].total
            }))
            .sort((a, b) => b.percentage - a.percentage);
        
        const container = document.getElementById('categoryRanking');
        container.innerHTML = rankings.map((item, index) => `
            <div class="ranking-item">
                <div class="ranking-position">#${index + 1}</div>
                <div class="ranking-info">
                    <div class="ranking-name">${item.category}</div>
                    <div class="ranking-details">${item.correct}/${item.total} correct answers</div>
                </div>
                <div class="ranking-score">${item.percentage}%</div>
            </div>
        `).join('');
    }

    loadTopPerformers() {
        const submittedResults = this.results.filter(r => r.submitted);
        if (submittedResults.length === 0) {
            document.getElementById('topPerformers').innerHTML = '<p>No data available</p>';
            return;
        }
        
        const topPerformers = submittedResults
            .sort((a, b) => b.overallScore - a.overallScore)
            .slice(0, 5);
        
        const container = document.getElementById('topPerformers');
        container.innerHTML = topPerformers.map((result, index) => `
            <div class="ranking-item">
                <div class="ranking-position">#${index + 1}</div>
                <div class="ranking-info">
                    <div class="ranking-name">${result.userName}</div>
                    <div class="ranking-details">${result.userDepartment}</div>
                </div>
                <div class="ranking-score">${result.overallScore}%</div>
            </div>
        `).join('');
    }

    loadRecentSubmissions() {
        const submittedResults = this.results.filter(r => r.submitted);
        if (submittedResults.length === 0) {
            document.getElementById('recentSubmissions').innerHTML = '<p>No submissions yet</p>';
            return;
        }
        
        const recent = submittedResults
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
            .slice(0, 5);
        
        const container = document.getElementById('recentSubmissions');
        container.innerHTML = recent.map(result => `
            <div class="recent-item" style="padding: 10px; border-left: 4px solid ${result.passed ? '#28a745' : '#dc3545'}; margin-bottom: 10px; background: white; border-radius: 5px;">
                <strong>${result.userName}</strong> - ${result.overallScore}% 
                <span class="${result.passed ? 'status-pass' : 'status-fail'}">(${result.passed ? 'PASS' : 'FAIL'})</span>
                <br><small>${new Date(result.submittedAt).toLocaleString()}</small>
            </div>
        `).join('');
    }

    loadLowPerformers() {
        const submittedResults = this.results.filter(r => r.submitted && !r.passed);
        if (submittedResults.length === 0) {
            document.getElementById('lowPerformers').innerHTML = '<p>All users passed! 🎉</p>';
            return;
        }
        
        const lowPerformers = submittedResults
            .sort((a, b) => a.overallScore - b.overallScore)
            .slice(0, 5);
        
        const container = document.getElementById('lowPerformers');
        container.innerHTML = lowPerformers.map(result => `
            <div class="ranking-item">
                <div class="ranking-info">
                    <div class="ranking-name">${result.userName}</div>
                    <div class="ranking-details">${result.userDepartment}</div>
                </div>
                <div class="ranking-score" style="color: #dc3545;">${result.overallScore}%</div>
            </div>
        `).join('');
    }

    loadAllResults() {
        this.filterResults();
    }

    filterResults() {
        const searchTerm = document.getElementById('searchResults').value.toLowerCase();
        const statusFilter = document.getElementById('filterStatus').value;
        const sortBy = document.getElementById('sortResults').value;
        
        let filteredResults = this.results.filter(r => r.submitted);
        
        if (searchTerm) {
            filteredResults = filteredResults.filter(result => 
                result.userName.toLowerCase().includes(searchTerm) ||
                (result.userDepartment && result.userDepartment.toLowerCase().includes(searchTerm))
            );
        }
        
        if (statusFilter) {
            filteredResults = filteredResults.filter(result => 
                statusFilter === 'pass' ? result.passed : !result.passed
            );
        }
        
        filteredResults.sort((a, b) => {
            switch(sortBy) {
                case 'score':
                    return b.overallScore - a.overallScore;
                case 'name':
                    return a.userName.localeCompare(b.userName);
                case 'date':
                default:
                    return new Date(b.submittedAt) - new Date(a.submittedAt);
            }
        });
        
        this.displayResultsTable(filteredResults);
    }

    displayResultsTable(results) {
        const container = document.getElementById('allResultsList');
        
        if (results.length === 0) {
            container.innerHTML = '<p>No results found.</p>';
            return;
        }
        
        const table = document.createElement('table');
        table.className = 'results-table';
        
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${results.map(result => `
                    <tr>
                        <td>${result.userName}</td>
                        <td>${result.userDepartment}</td>
                        <td>${result.overallScore}%</td>
                        <td class="${result.passed ? 'status-pass' : 'status-fail'}">
                            ${result.passed ? '✅ PASS' : '❌ FAIL'}
                        </td>
                        <td>${new Date(result.submittedAt).toLocaleString()}</td>
                        <td>${Math.floor(result.duration / 60)}:${(result.duration % 60).toString().padStart(2, '0')}</td>
                        <td>
                            <button class="btn-small btn-primary" onclick="quiz.viewResultDetails('${result.id}')">View</button>
                            <button class="btn-small btn-danger" onclick="quiz.deleteResult('${result.id}')">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        
        container.innerHTML = '';
        container.appendChild(table);
    }

    viewResultDetails(resultId) {
        const result = this.results.find(r => r.id === resultId);
        if (!result) return;
        
        alert(`Detailed Results for ${result.userName}\n\n` +
              `Overall Score: ${result.overallScore}%\n` +
              `Status: ${result.passed ? 'PASS' : 'FAIL'}\n` +
              `Duration: ${Math.floor(result.duration / 60)}:${(result.duration % 60).toString().padStart(2, '0')}\n\n` +
              `Category Breakdown:\n` +
              Object.keys(result.categoryScores).map(cat => 
                  `${cat}: ${Math.round((result.categoryScores[cat] / result.categoryTotals[cat]) * 100)}%`
              ).join('\n'));
    }

    async deleteResult(resultId) {
        if (confirm('Are you sure you want to delete this result?')) {
            this.results = this.results.filter(r => r.id !== resultId);
            await this.saveResults();
            this.filterResults();
            this.updateDashboardStats();
            this.showMessage('Result deleted successfully.', 'success');
        }
    }

    loadAnalytics() {
        this.loadCategoryAnalytics();
        this.loadScoreDistribution();
        this.loadQuestionDifficulty();
    }

    loadCategoryAnalytics() {
        const submittedResults = this.results.filter(r => r.submitted);
        if (submittedResults.length === 0) {
            document.getElementById('categoryAnalytics').innerHTML = '<p>No data available</p>';
            return;
        }
        
        const categoryStats = {};
        
        quizConfig.categories.forEach(cat => {
            categoryStats[cat] = { correct: 0, total: 0, attempts: 0 };
        });
        
        submittedResults.forEach(result => {
            Object.keys(result.categoryScores).forEach(category => {
                if (categoryStats[category]) {
                    categoryStats[category].correct += result.categoryScores[category];
                    categoryStats[category].total += result.categoryTotals[category];
                    categoryStats[category].attempts++;
                }
            });
        });
        
        const container = document.getElementById('categoryAnalytics');
        container.innerHTML = Object.keys(categoryStats).map(category => {
            const stats = categoryStats[category];
            const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
            
            return `
                <div style="background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea;">
                    <h5>${category}</h5>
                    <p><strong>Average Score:</strong> ${percentage}%</p>
                    <p><strong>Total Answers:</strong> ${stats.correct}/${stats.total} correct</p>
                    <p><strong>User Attempts:</strong> ${stats.attempts}</p>
                </div>
            `;
        }).join('');
    }

    loadScoreDistribution() {
        const submittedResults = this.results.filter(r => r.submitted);
        if (submittedResults.length === 0) {
            document.getElementById('scoreDistribution').innerHTML = '<p>No data available</p>';
            return;
        }
        
        const ranges = {
            '90-100%': 0,
            '80-89%': 0,
            '70-79%': 0,
            '60-69%': 0,
            'Below 60%': 0
        };
        
        submittedResults.forEach(result => {
            const score = result.overallScore;
            if (score >= 90) ranges['90-100%']++;
            else if (score >= 80) ranges['80-89%']++;
            else if (score >= 70) ranges['70-79%']++;
            else if (score >= 60) ranges['60-69%']++;
            else ranges['Below 60%']++;
        });
        
        const container = document.getElementById('scoreDistribution');
        container.innerHTML = Object.keys(ranges).map(range => `
            <div style="display: flex; justify-content: space-between; padding: 10px; background: white; margin: 5px 0; border-radius: 5px;">
                <span>${range}</span>
                <strong>${ranges[range]} users</strong>
            </div>
        `).join('');
    }

    loadQuestionDifficulty() {
        const submittedResults = this.results.filter(r => r.submitted);
        if (submittedResults.length === 0) {
            document.getElementById('questionDifficulty').innerHTML = '<p>No data available</p>';
            return;
        }
        
        const questionStats = {};
        
        submittedResults.forEach(result => {
            result.detailedAnswers.forEach(answer => {
                if (!questionStats[answer.question]) {
                    questionStats[answer.question] = { correct: 0, total: 0 };
                }
                questionStats[answer.question].total++;
                if (answer.isCorrect) {
                    questionStats[answer.question].correct++;
                }
            });
        });
        
        const sortedQuestions = Object.keys(questionStats)
            .map(question => ({
                question: question.substring(0, 50) + '...',
                percentage: Math.round((questionStats[question].correct / questionStats[question].total) * 100),
                correct: questionStats[question].correct,
                total: questionStats[question].total
            }))
            .sort((a, b) => a.percentage - b.percentage)
            .slice(0, 10);
        
        const container = document.getElementById('questionDifficulty');
        container.innerHTML = '<h5>Most Difficult Questions:</h5>' + 
            sortedQuestions.map(q => `
                <div style="background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 5px; border-left: 4px solid ${q.percentage < 50 ? '#dc3545' : '#ffc107'};">
                    <div><strong>${q.question}</strong></div>
                    <div>Success Rate: ${q.percentage}% (${q.correct}/${q.total})</div>
                </div>
            `).join('');
    }

    loadQuestions() {
        this.populateCategorySelects();
        this.filterQuestions();
    }

    populateCategorySelects() {
        const selects = ['questionCategory', 'editQuestionCategory', 'filterCategory'];
        
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (selectId === 'filterCategory') {
                select.innerHTML = '<option value="">All Categories</option>';
            } else {
                select.innerHTML = '';
            }
            
            quizConfig.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                select.appendChild(option);
            });
        });
    }

    filterQuestions() {
        const searchTerm = document.getElementById('searchQuestions').value.toLowerCase();
        const categoryFilter = document.getElementById('filterCategory').value;
        
        const container = document.getElementById('questionsList');
        container.innerHTML = '';
        
        Object.keys(questionBank).forEach(category => {
            if (categoryFilter && category !== categoryFilter) return;
            
            const categoryQuestions = questionBank[category].filter(q => 
                !searchTerm || q.question.toLowerCase().includes(searchTerm)
            );
            
            if (categoryQuestions.length === 0) return;
            
            const categoryDiv = document.createElement('div');
            categoryDiv.innerHTML = `<h4>${category} (${categoryQuestions.length} questions)</h4>`;
            
            categoryQuestions.forEach(question => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'question-item';
                questionDiv.innerHTML = `
                    <div class="question-header">
                        <span class="question-category">${category}</span>
                        <div class="question-actions">
                            <button class="btn-small btn-primary" onclick="quiz.editQuestion('${question.id}', '${category}')">Edit</button>
                            <button class="btn-small btn-danger" onclick="quiz.deleteQuestion('${question.id}', '${category}')">Delete</button>
                        </div>
                    </div>
                    <div class="question-text">${question.question}</div>
                    <div class="question-options">
                        ${question.options.map((option, index) => `
                            <div class="${index === question.correct ? 'correct-option' : ''}">
                                ${String.fromCharCode(65 + index)}: ${option}
                            </div>
                        `).join('')}
                    </div>
                `;
                categoryDiv.appendChild(questionDiv);
            });
            
            container.appendChild(categoryDiv);
        });
    }

    loadCategories() {
        const container = document.getElementById('categoriesList');
        container.innerHTML = '';
        
        quizConfig.categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category-item';
            categoryDiv.innerHTML = `
                <div class="category-info">
                    <h4>${category}</h4>
                    <p>${questionBank[category].length} questions available</p>
                </div>
                <div class="category-stats">
                    <div>${questionBank[category].length} Questions</div>
                    <button class="btn-small btn-danger" onclick="quiz.deleteCategory('${category}')">Delete</button>
                </div>
            `;
            container.appendChild(categoryDiv);
        });
    }

    loadUserRankings() {
        const submittedResults = this.results.filter(r => r.submitted);
        if (submittedResults.length === 0) {
            document.getElementById('userRankings').innerHTML = '<p>No user data available</p>';
            return;
        }
        
        const userBestScores = {};
        submittedResults.forEach(result => {
            if (!userBestScores[result.userName] || result.overallScore > userBestScores[result.userName].overallScore) {
                userBestScores[result.userName] = result;
            }
        });
        
        const rankings = Object.values(userBestScores)
            .sort((a, b) => b.overallScore - a.overallScore);
        
        const container = document.getElementById('userRankings');
        container.innerHTML = rankings.map((result, index) => `
            <div class="ranking-item">
                <div class="ranking-position">#${index + 1}</div>
                <div class="ranking-info">
                    <div class="ranking-name">${result.userName}</div>
                    <div class="ranking-details">${result.userDepartment}</div>
                </div>
                <div class="ranking-score">${result.overallScore}%</div>
            </div>
        `).join('');
    }

    // Modal Management
    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }

    hideModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        
        const form = document.querySelector(`#${modalId} form`);
        if (form) form.reset();
    }

    showAddQuestionModal() {
        this.populateCategorySelects();
        this.showModal('addQuestionModal');
    }

    showAddCategoryModal() {
        this.showModal('addCategoryModal');
    }

    addNewQuestion() {
        const category = document.getElementById('questionCategory').value;
        const questionText = document.getElementById('questionText').value;
        const options = [
            document.getElementById('optionA').value,
            document.getElementById('optionB').value,
            document.getElementById('optionC').value,
            document.getElementById('optionD').value
        ];
        const correct = parseInt(document.getElementById('correctAnswer').value);
        const explanation = document.getElementById('explanation').value;
        
        const newQuestion = {
            id: `custom_${Date.now()}`,
            question: questionText,
            options: options,
            correct: correct,
            explanation: explanation
        };
        
        if (!questionBank[category]) {
            questionBank[category] = [];
        }
        questionBank[category].push(newQuestion);
        
        saveCustomQuestions();
        this.hideModal('addQuestionModal');
        this.loadQuestions();
        this.showMessage('Question added successfully!', 'success');
    }

    addNewCategory() {
        const categoryName = document.getElementById('categoryName').value.trim();
        
        if (!categoryName) {
            this.showMessage('Category name is required.', 'error');
            return;
        }
        
        if (questionBank[categoryName]) {
            this.showMessage('Category already exists.', 'error');
            return;
        }
        
        questionBank[categoryName] = [];
        quizConfig.categories = Object.keys(questionBank);
        
        saveCustomCategories();
        this.hideModal('addCategoryModal');
        this.loadCategories();
        this.populateCategorySelects();
        this.showMessage('Category added successfully!', 'success');
    }

    editQuestion(questionId, category) {
        const question = questionBank[category].find(q => q.id === questionId);
        if (!question) return;
        
        document.getElementById('editQuestionId').value = questionId;
        document.getElementById('editOriginalCategory').value = category;
        document.getElementById('editQuestionCategory').value = category;
        document.getElementById('editQuestionText').value = question.question;
        document.getElementById('editOptionA').value = question.options[0];
        document.getElementById('editOptionB').value = question.options[1];
        document.getElementById('editOptionC').value = question.options[2];
        document.getElementById('editOptionD').value = question.options[3];
        document.getElementById('editCorrectAnswer').value = question.correct;
        document.getElementById('editExplanation').value = question.explanation || '';
        
        this.populateCategorySelects();
        this.showModal('editQuestionModal');
    }

    updateQuestion() {
        const questionId = document.getElementById('editQuestionId').value;
        const oldCategory = document.getElementById('editOriginalCategory').value;
        const newCategory = document.getElementById('editQuestionCategory').value;
        
        const updatedQuestion = {
            id: questionId,
            question: document.getElementById('editQuestionText').value,
            options: [
                document.getElementById('editOptionA').value,
                document.getElementById('editOptionB').value,
                document.getElementById('editOptionC').value,
                document.getElementById('editOptionD').value
            ],
            correct: parseInt(document.getElementById('editCorrectAnswer').value),
            explanation: document.getElementById('editExplanation').value
        };
        
        const questionIndex = questionBank[oldCategory].findIndex(q => q.id === questionId);
        if (questionIndex !== -1) {
            if (oldCategory === newCategory) {
                questionBank[oldCategory][questionIndex] = updatedQuestion;
            } else {
                questionBank[oldCategory].splice(questionIndex, 1);
                if (!questionBank[newCategory]) {
                    questionBank[newCategory] = [];
                }
                questionBank[newCategory].push(updatedQuestion);
            }
            
            saveCustomQuestions();
            this.hideModal('editQuestionModal');
            this.loadQuestions();
            this.showMessage('Question updated successfully!', 'success');
        }
    }

    deleteQuestion(questionId, category) {
        if (confirm('Are you sure you want to delete this question?')) {
            const questionIndex = questionBank[category].findIndex(q => q.id === questionId);
            if (questionIndex !== -1) {
                questionBank[category].splice(questionIndex, 1);
                saveCustomQuestions();
                this.loadQuestions();
                this.showMessage('Question deleted successfully.', 'success');
            }
        }
    }

    deleteCategory(categoryName) {
        if (confirm(`Are you sure you want to delete the category "${categoryName}" and all its questions?`)) {
            delete questionBank[categoryName];
            quizConfig.categories = Object.keys(questionBank);
            
            saveCustomCategories();
            saveCustomQuestions();
            this.loadCategories();
            this.populateCategorySelects();
            this.showMessage('Category deleted successfully.', 'success');
        }
    }

    // Data Management
    exportAllResults() {
        const submittedResults = this.results.filter(r => r.submitted);
        if (submittedResults.length === 0) {
            this.showMessage('No results to export.', 'info');
            return;
        }
        
        const csv = this.convertResultToCSV(submittedResults);
        this.downloadCSV(csv, `cgf_all_results_${new Date().toISOString().split('T')[0]}.csv`);
        this.showMessage('Results exported successfully!', 'success');
    }

    exportUserRankings() {
        const submittedResults = this.results.filter(r => r.submitted);
        if (submittedResults.length === 0) {
            this.showMessage('No rankings to export.', 'info');
            return;
        }
        
        const userBestScores = {};
        submittedResults.forEach(result => {
            if (!userBestScores[result.userName] || result.overallScore > userBestScores[result.userName].overallScore) {
                userBestScores[result.userName] = result;
            }
        });
        
        const rankings = Object.values(userBestScores)
            .sort((a, b) => b.overallScore - a.overallScore);
        
        const csv = this.convertResultToCSV(rankings);
        this.downloadCSV(csv, `cgf_user_rankings_${new Date().toISOString().split('T')[0]}.csv`);
        this.showMessage('Rankings exported successfully!', 'success');
    }

    async clearAllResults() {
        if (confirm('Are you sure you want to clear all results? This action cannot be undone.')) {
            this.results = [];
            await this.saveResults();
            this.loadAdminDashboard();
            this.loadAllResults();
            this.showMessage('All results cleared.', 'info');
        }
    }

    convertResultToCSV(results) {
        const headers = [
            'Name', 'Department', 'Date', 'Overall Score', 'Status', 
            'Duration (seconds)', 'Physical Security', 'Access Control', 
            'Data Protection', 'Incident Response'
        ];
        
        const rows = results.map(result => [
            result.userName,
            result.userDepartment,
            new Date(result.submittedAt).toLocaleString(),
            `${result.overallScore}%`,
            result.passed ? 'PASS' : 'FAIL',
            result.duration,
            ...quizConfig.categories.map(cat => {
                const score = result.categoryScores[cat] || 0;
                const total = result.categoryTotals[cat] || 1;
                return `${Math.round((score / total) * 100)}%`;
            })
        ]);
        
        return [headers, ...rows].map(row => 
            row.map(cell => `"${cell}"`).join(',')
        ).join('\n');
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    async saveResults() {
        // Save to localStorage first (immediate backup)
        localStorage.setItem('cgf-quiz-results', JSON.stringify(this.results));
        
        // Save to Gist (cloud storage)
        const response = await this.gistAPI.saveData(this.results);
        
        if (response.success) {
            console.log('Results saved to cloud successfully');
        } else {
            console.error('Failed to save to cloud:', response.error);
            this.showMessage('Warning: Results saved locally but failed to sync to cloud.', 'error');
        }
    }

    async loadResults() {
        // Show loading message
        console.log('Loading results from cloud...');
        
        // Load from Gist
        const cloudResults = await this.gistAPI.loadData();
        
        // Load from localStorage as backup
        const localResults = JSON.parse(localStorage.getItem('cgf-quiz-results') || '[]');
        
        // Merge results (cloud takes priority)
        const allResults = [...cloudResults];
        
        // Add any local results that aren't in cloud
        localResults.forEach(localResult => {
            if (!cloudResults.find(cr => cr.id === localResult.id)) {
                allResults.push(localResult);
            }
        });
        
        this.results = allResults;
        console.log(`Loaded ${this.results.length} results`);
    }

    showMessage(text, type) {
        document.querySelectorAll('.message').forEach(msg => msg.remove());
        
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        let container = null;
        if (this.currentInterface === 'login') {
            container = document.querySelector('.login-card');
        } else if (this.currentInterface === 'user') {
            container = document.querySelector('.screen.active .welcome-card, .screen.active .results-card');
        } else if (this.currentInterface === 'admin') {
            container = document.querySelector('.tab-content.active');
        }
        
        if (container) {
            container.insertBefore(message, container.firstChild);
            
            setTimeout(() => {
                if (message.parentNode) {
                    message.remove();
                }
            }, 5000);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.quiz = new SecurityQuizApp();
});

// Global functions for onclick handlers
function viewResultDetails(resultId) {
    window.quiz.viewResultDetails(resultId);
}

function deleteResult(resultId) {
    window.quiz.deleteResult(resultId);
}

function editQuestion(questionId, category) {
    window.quiz.editQuestion(questionId, category);
}

function deleteQuestion(questionId, category) {
    window.quiz.deleteQuestion(questionId, category);
}

function deleteCategory(categoryName) {
    window.quiz.deleteCategory(categoryName);
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});
