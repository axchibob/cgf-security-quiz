// Add to the constructor
constructor() {
    // ... existing code ...
    this.sharedManager = new SharedResultsManager();
}

// Add to initializeApp
async initializeApp() {
    this.loadResults();
    await this.sharedManager.initialize();
    this.setupEventListeners();
    this.showScreen('welcome-screen');
}

// Update setupEventListeners to include shared results
setupEventListeners() {
    // ... existing code ...
    
    // Shared results functionality
    document.getElementById('refreshSharedBtn').addEventListener('click', () => this.refreshSharedResults());
    document.getElementById('exportSharedBtn').addEventListener('click', () => this.sharedManager.exportSharedResults());
    document.getElementById('syncResultsBtn').addEventListener('click', () => this.syncLocalToShared());
    
    // Configuration modal
    document.querySelectorAll('.config-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const method = e.currentTarget.dataset.method;
            this.setupSharedDatabase(method);
        });
    });
}

// Add these new methods:

async refreshSharedResults() {
    try {
        document.getElementById('refreshSharedBtn').innerHTML = '<span class="loading"></span> Loading...';
        
        await this.sharedManager.loadSharedResults();
        this.loadSharedResultsTab();
        this.showMessage('Shared results refreshed successfully!', 'success');
    } catch (error) {
        this.showMessage('Failed to refresh shared results.', 'error');
    } finally {
        document.getElementById('refreshSharedBtn').innerHTML = '🔄 Refresh';
    }
}

async syncLocalToShared() {
    if (this.results.length === 0) {
        this.showMessage('No local results to sync.', 'info');
        return;
    }

    try {
        document.getElementById('syncResultsBtn').innerHTML = '<span class="loading"></span> Syncing...';
        
        const success = await this.sharedManager.syncToShared(this.results);
        
        if (success) {
            this.showMessage(`Successfully synced ${this.results.length} results to shared database!`, 'success');
            this.loadSharedResultsTab();
        } else {
            this.showMessage('Failed to sync results. Please check your configuration.', 'error');
        }
    } catch (error) {
        this.showMessage('Sync failed. Please try again.', 'error');
    } finally {
        document.getElementById('syncResultsBtn').innerHTML = '📤 Sync Local to Shared';
    }
}

async setupSharedDatabase(method) {
    let success = false;
    
    switch (method) {
        case 'github':
            success = await this.sharedManager.setupGitHubGist();
            break;
        case 'firebase':
            success = this.sharedManager.setupFirebase();
            break;
        case 'json':
            success = this.sharedManager.setupJsonSharing();
            break;
    }
    
    if (success) {
        this.showMessage(`${method.charAt(0).toUpperCase() + method.slice(1)} sharing configured successfully!`, 'success');
        this.loadSharedResultsTab();
    }
}

loadSharedResultsTab() {
    // Update shared database info
    document.getElementById('sharedDbUrl').textContent = this.sharedManager.sharedDbUrl || 'Not configured';
    document.getElementById('lastSync').textContent = this.sharedManager.lastSync ? 
        new Date(this.sharedManager.lastSync).toLocaleString() : 'Never';
    document.getElementById('sharedCount').textContent = this.sharedManager.sharedResults.length;
    
    // Load shared results table
    const container = document.getElementById('sharedResultsList');
    
    if (this.sharedManager.sharedResults.length === 0) {
        container.innerHTML = '<p>No shared results available. <button onclick="document.getElementById(\'configModal\').style.display=\'block\'" class="btn-primary">Configure Sharing</button></p>';
        return;
    }
    
    const table = document.createElement('table');
    table.className = 'results-table';
    
    table.innerHTML = `
        <thead>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Date</th>
                <th>Score</th>
                <th>Status</th>
                <th>Source</th>
            </tr>
        </thead>
        <tbody>
            ${this.sharedManager.sharedResults.map(result => `
                <tr>
                    <td>${result.userName}</td>
                    <td>${result.userEmail || 'N/A'}</td>
                    <td>${new Date(result.date).toLocaleString()}</td>
                    <td>${result.overallScore}%</td>
                    <td class="${result.passed ? 'status-pass' : 'status-fail'}">
                        ${result.passed ? '✅ PASS' : '❌ FAIL'}
                    </td>
                    <td>${result.source || 'unknown'}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    container.innerHTML = '';
    container.appendChild(table);
}

// Update saveResults to include email
saveResults(results) {
    // Add email to results
    results.userEmail = document.getElementById('userEmail').value;
    
    this.results.push(results);
    localStorage.setItem('cgf-quiz-results', JSON.stringify(this.results));
    
    // Auto-sync to shared database if configured
    if (this.sharedManager.sharedDbUrl) {
        this.sharedManager.syncToShared([results]).then(success => {
            if (success) {
                console.log('Result automatically synced to shared database');
            }
        });
    }
}

// Update switchTab to handle shared tab
switchTab(tabName) {
    // ... existing code ...
    
    if (tabName === 'shared') this.loadSharedResultsTab();
}
