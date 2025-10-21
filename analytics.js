let userStats = {};
let globalStats = {};
let userId = null;

function showTab(tab) {
    document.querySelectorAll('.analytics-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.analytics-tab-content').forEach(t => t.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tab + '-tab').classList.add('active');
}

async function loadAnalyticsData() {
    userId = localStorage.getItem('vexusUserId') || 'user_' + Date.now();
    
    // Load user stats from AWS first, fallback to localStorage
    try {
        // For now, use localStorage until user-stats endpoint is available
        // const userResponse = await fetch(`https://9o6yuxxlnk.execute-api.us-east-1.amazonaws.com/prod/global-stats?userId=${userId}`);
        if (userResponse.ok) {
            userStats = await userResponse.json();
        } else {
            throw new Error('AWS user stats not available');
        }
    } catch (error) {
        const saved = localStorage.getItem('cupGameStats');
        if (saved) {
            userStats = JSON.parse(saved);
        }
    }
    
    // Load global stats from API
    try {
        const response = await fetch('https://9o6yuxxlnk.execute-api.us-east-1.amazonaws.com/prod/global-stats');
        if (response.ok) {
            globalStats = await response.json();
        } else {
            throw new Error('AWS global stats not available');
        }
    } catch (error) {
        globalStats = { totalUsers: 0, totalGames: 0, avgAccuracy: 0, browsers: {}, userAccuracies: [] };
    }
    
    updateAnalyticsVisualizations();
}

function updateAnalyticsVisualizations() {
    // User metrics
    document.getElementById('user-games').textContent = userStats.gamesPlayed || 0;
    document.getElementById('user-accuracy').textContent = (userStats.accuracy || 0) + '%';
    document.getElementById('accuracy-bar').style.width = (userStats.accuracy || 0) + '%';
    
    // Global metrics
    document.getElementById('global-users').textContent = globalStats.totalUsers || 0;
    document.getElementById('global-games').textContent = globalStats.totalGames || 0;
    document.getElementById('global-accuracy').textContent = (globalStats.avgAccuracy || 0) + '%';
    document.getElementById('global-accuracy-bar').style.width = (globalStats.avgAccuracy || 0) + '%';
    
    // User ranking
    const userRank = getUserRank();
    const rankElement = document.getElementById('user-rank');
    if (rankElement) {
        rankElement.textContent = userRank;
    }
    
    createAnalyticsCharts();
}

function createAnalyticsCharts() {
    // Performance trend chart
    new Chart(document.getElementById('performance-chart'), {
        type: 'line',
        data: {
            labels: ['Game 1', 'Game 2', 'Game 3', 'Game 4', 'Game 5'],
            datasets: [{
                label: 'Accuracy %',
                data: generateTrendData(),
                borderColor: '#00ff88',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, max: 100, grid: { color: '#333' }, ticks: { color: '#fff' } },
                x: { grid: { color: '#333' }, ticks: { color: '#fff' } }
            }
        }
    });
    
    // Timing chart
    new Chart(document.getElementById('timing-chart'), {
        type: 'bar',
        data: {
            labels: ['Fastest', 'Average', 'Slowest'],
            datasets: [{
                data: [
                    (userStats.fastestGame || 0) / 1000,
                    (userStats.avgGameTime || 0) / 1000,
                    (userStats.slowestGame || 0) / 1000
                ],
                backgroundColor: ['#00ff88', '#0066cc', '#ff6b6b']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Seconds', color: '#fff' }, grid: { color: '#333' }, ticks: { color: '#fff' } },
                x: { grid: { color: '#333' }, ticks: { color: '#fff' } }
            }
        }
    });
    
    // Browser distribution
    const browserData = getBrowserDistribution();
    new Chart(document.getElementById('browser-chart'), {
        type: 'doughnut',
        data: {
            labels: browserData.labels,
            datasets: [{
                data: browserData.data,
                backgroundColor: ['#0066cc', '#ff6b6b', '#00ff88', '#ffaa00']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } }
        }
    });
    
    // Comparison chart
    new Chart(document.getElementById('comparison-chart'), {
        type: 'radar',
        data: {
            labels: ['Accuracy', 'Speed', 'Consistency', 'Experience'],
            datasets: [{
                label: 'You',
                data: [
                    userStats.accuracy || 0,
                    calculateUserSpeed(),
                    calculateUserConsistency(),
                    Math.min((userStats.gamesPlayed || 0) * 10, 100)
                ],
                borderColor: '#00ff88',
                backgroundColor: 'rgba(0, 255, 136, 0.2)'
            }, {
                label: 'Global Average',
                data: [
                    globalStats.avgAccuracy || 0,
                    globalStats.avgSpeed || 65,
                    globalStats.avgConsistency || 70,
                    globalStats.avgExperience || 80
                ],
                borderColor: '#0066cc',
                backgroundColor: 'rgba(0, 102, 204, 0.2)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#fff' } } },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: '#333' },
                    pointLabels: { color: '#fff' },
                    ticks: { color: '#fff', display: false }
                }
            }
        }
    });
}

function generateTrendData() {
    const games = userStats.gamesPlayed || 0;
    if (games === 0) return [0, 0, 0, 0, 0];
    
    const accuracy = userStats.accuracy || 0;
    const trend = [];
    const baseAccuracy = Math.max(0, accuracy - 20);
    
    for (let i = 0; i < 5; i++) {
        const gameAccuracy = Math.min(100, baseAccuracy + (i * 8) + (Math.random() * 10));
        trend.push(Math.round(gameAccuracy));
    }
    
    return trend;
}

function getBrowserDistribution() {
    if (globalStats.browsers && Object.keys(globalStats.browsers).length > 0) {
        const browsers = globalStats.browsers;
        const total = Object.values(browsers).reduce((sum, count) => sum + count, 0);
        
        return {
            labels: Object.keys(browsers),
            data: Object.values(browsers).map(count => Math.round((count / total) * 100))
        };
    }
    
    // Fallback data
    return {
        labels: ['Chrome', 'Firefox', 'Safari', 'Edge'],
        data: [70, 15, 10, 5]
    };
}

function calculateUserSpeed() {
    if (!userStats.fastestGame) return 50;
    // Convert fastest game time to 0-100 scale (lower time = higher score)
    return Math.max(0, 100 - (userStats.fastestGame / 1000));
}

function calculateUserConsistency() {
    if (!userStats.fastestGame || !userStats.slowestGame) return 50;
    // Calculate consistency based on time variance
    const variance = Math.abs(userStats.slowestGame - userStats.fastestGame);
    return Math.max(0, 100 - (variance / 1000));
}

function getUserRank() {
    if (!globalStats.userAccuracies || !userStats.gamesPlayed) return 'Unranked';
    
    const userAccuracy = userStats.accuracy || 0;
    const betterUsers = globalStats.userAccuracies.filter(acc => acc > userAccuracy).length;
    return `#${betterUsers + 1}`;
}

// Initialize analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadAnalyticsData();
    setInterval(loadAnalyticsData, 30000);
});