// Shared Results Management System
class SharedResultsManager {
    constructor() {
        this.sharedDbUrl = localStorage.getItem('cgf-shared-db-url') || null;
        this.lastSync = localStorage.getItem('cgf-last-sync') || null;
        this.sharedResults = [];
        this.syncMethod = localStorage.getItem('cgf-sync-method') || 'github';
    }

    // Initialize shared results system
    async initialize() {
        if (this.sharedDbUrl) {
            await this.loadSharedResults();
        }
    }

    // Setup GitHub Gist for sharing
    async setupGitHubGist() {
        const gistId = prompt('Enter your GitHub Gist ID (or leave empty to create new):');
        const token = prompt('Enter your GitHub Personal Access Token:');
        
        if (!token) {
            alert('GitHub token is required for sharing results.');
            return false;
        }

        if (gistId) {
            // Use existing gist
            this.sharedDbUrl = `https://api.github.com/gists/${gistId}`;
        } else {
            // Create new gist
            try {
                const response = await fetch('https://api.github.com/gists', {
                    method: 'POST',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        description: 'CGF Security Quiz Results Database',
                        public: false,
                        files: {
                            'cgf-quiz-results.json': {
                                content: JSON.stringify({
                                    created: new Date().toISOString(),
                                    results: []
                                })
                            }
                        }
                    })
                });

                const gist = await response.json();
                this.sharedDbUrl = gist.url;
                
                alert(`Gist created successfully! Share this ID with others: ${gist.id}`);
            } catch (error) {
                alert('Failed to create GitHub Gist. Please check your token.');
                return false;
            }
        }

        localStorage.setItem('cgf-shared-db-url', this.sharedDbUrl);
        localStorage.setItem('cgf-github-token', token);
        localStorage.setItem('cgf-sync-method', 'github');
        
        return true;
    }

    // Setup Firebase database
    setupFirebase() {
        const firebaseUrl = prompt('Enter your Firebase Database URL:');
        if (!firebaseUrl) return false;

        this.sharedDbUrl = firebaseUrl;
        localStorage.setItem('cgf-shared-db-url', firebaseUrl);
        localStorage.setItem('cgf-sync-method', 'firebase');
        
        return true;
    }

    // Setup JSON file sharing
    setupJsonSharing() {
        const jsonUrl = prompt('Enter the URL to your shared JSON file:');
        if (!jsonUrl) return false;

        this.sharedDbUrl = jsonUrl;
        localStorage.setItem('cgf-shared-db-url', jsonUrl);
        localStorage.setItem('cgf-sync-method', 'json');
        
        return true;
    }

    // Load shared results from configured source
    async loadSharedResults() {
        if (!this.sharedDbUrl) return [];

        try {
            let response;
            
            switch (this.syncMethod) {
                case 'github':
                    response = await this.loadFromGitHub();
                    break;
                case 'firebase':
                    response = await this.loadFromFirebase();
                    break;
                case 'json':
                    response = await this.loadFromJson();
                    break;
                default:
                    throw new Error('Unknown sync method');
            }

            this.sharedResults = response.results || [];
            this.lastSync = new Date().toISOString();
            localStorage.setItem('cgf-last-sync', this.lastSync);
            
            return this.sharedResults;
        } catch (error) {
            console.error('Failed to load shared results:', error);
            return [];
        }
    }

    // Load from GitHub Gist
    async loadFromGitHub() {
        const token = localStorage.getItem('cgf-github-token');
        const headers = token ? { 'Authorization': `token ${token}` } : {};
        
        const response = await fetch(this.sharedDbUrl, { headers });
        const gist = await response.json();
        
        const fileContent = Object.values(gist.files)[0].content;
        return JSON.parse(fileContent);
    }

    // Load from Firebase
    async loadFromFirebase() {
        const response = await fetch(`${this.sharedDbUrl}/results.json`);
        return await response.json();
    }

    // Load from JSON URL
    async loadFromJson() {
        const response = await fetch(this.sharedDbUrl);
        return await response.json();
    }

    // Sync local results to shared database
    async syncToShared(localResults) {
        if (!this.sharedDbUrl || !localResults.length) return false;

        try {
            // Load existing shared results
            await this.loadSharedResults();
            
            // Merge local results with shared results (avoid duplicates)
            const mergedResults = [...this.sharedResults];
            
            localResults.forEach(localResult => {
                const exists = mergedResults.find(shared => 
                    shared.userName === localResult.userName && 
                    shared.date === localResult.date
                );
                
                if (!exists) {
                    mergedResults.push({
                        ...localResult,
                        syncedAt: new Date().toISOString(),
                        source: 'local'
                    });
                }
            });

            // Save back to shared database
            const success = await this.saveToShared(mergedResults);
            
            if (success) {
                this.sharedResults = mergedResults;
                this.lastSync = new Date().toISOString();
                localStorage.setItem('cgf-last-sync', this.lastSync);
            }
            
            return success;
        } catch (error) {
            console.error('Failed to sync to shared database:', error);
            return false;
        }
    }

    // Save results to shared database
    async saveToShared(results) {
        try {
            const data = {
                lastUpdated: new Date().toISOString(),
                totalResults: results.length,
                results: results
            };

            switch (this.syncMethod) {
                case 'github':
                    return await this.saveToGitHub(data);
                case 'firebase':
                    return await this.saveToFirebase(data);
                case 'json':
                    // JSON method is read-only for security
                    alert('JSON sharing is read-only. Use GitHub or Firebase for writing.');
                    return false;
                default:
                    return false;
            }
        } catch (error) {
            console.error('Failed to save to shared database:', error);
            return false;
        }
    }

    // Save to GitHub Gist
    async saveToGitHub(data) {
        const token = localStorage.getItem('cgf-github-token');
        if (!token) return false;

        const response = await fetch(this.sharedDbUrl, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: {
                    'cgf-quiz-results.json': {
                        content: JSON.stringify(data, null, 2)
                    }
                }
            })
        });

        return response.ok;
    }

    // Save to Firebase
    async saveToFirebase(data) {
        const response = await fetch(`${this.sharedDbUrl}/results.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        return response.ok;
    }

    // Get shared results statistics
    getSharedStats() {
        if (!this.sharedResults.length) {
            return {
                totalUsers: 0,
                totalAttempts: 0,
                averageScore: 0,
                passRate: 0
            };
        }

        const totalUsers = new Set(this.sharedResults.map(r => r.userName)).size;
        const totalAttempts = this.sharedResults.length;
        const averageScore = Math.round(
            this.sharedResults.reduce((sum, r) => sum + r.overallScore, 0) / totalAttempts
        );
        const passRate = Math.round(
            (this.sharedResults.filter(r => r.passed).length / totalAttempts) * 100
        );

        return {
            totalUsers,
            totalAttempts,
            averageScore,
            passRate
        };
    }

    // Export shared results to CSV
    exportSharedResults() {
        if (!this.sharedResults.length) {
            alert('No shared results to export.');
            return;
        }

        const headers = ['Name', 'Email', 'Date', 'Overall Score', 'Passed', 'Duration (seconds)', 'Physical Security', 'Access Control', 'Data Protection', 'Incident Response', 'Source'];
        
        const rows = this.sharedResults.map(result => [
            result.userName,
            result.userEmail || 'N/A',
            new Date(result.date).toLocaleString(),
            `${result.overallScore}%`,
            result.passed ? 'Yes' : 'No',
            result.duration,
            `${Math.round((result.categoryScores['Physical Security'] / result.categoryTotals['Physical Security']) * 100)}%`,
            `${Math.round((result.categoryScores['Access Control'] / result.categoryTotals['Access Control']) * 100)}%`,
            `${Math.round((result.categoryScores['Data Protection'] / result.categoryTotals['Data Protection']) * 100)}%`,
            `${Math.round((result.categoryScores['Incident Response'] / result.categoryTotals['Incident Response']) * 100)}%`,
            result.source || 'unknown'
        ]);
        
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cgf-shared-results-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Reset shared database configuration
    resetConfiguration() {
        if (confirm('Are you sure you want to reset the shared database configuration?')) {
            localStorage.removeItem('cgf-shared-db-url');
            localStorage.removeItem('cgf-github-token');
            localStorage.removeItem('cgf-sync-method');
            localStorage.removeItem('cgf-last-sync');
            
            this.sharedDbUrl = null;
            this.lastSync = null;
            this.sharedResults = [];
            
            alert('Shared database configuration reset.');
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SharedResultsManager;
}
