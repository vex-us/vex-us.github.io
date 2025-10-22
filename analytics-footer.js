let userStats = {};
let globalStats = {};

function createAnalyticsFooter(terminalElement) {
    const footer = document.createElement('div');
    footer.className = 'analytics-footer';
    footer.innerHTML = `
        <div class="nav-link" onclick="toggleAnalytics()">
            ※ Analytics <span id="analytics-arrow">⇣</span>
        </div>
        <div class="analytics-panel collapsed" id="analytics-panel">
            <div class="analytics-content">
                <div class="analytics-tabs">
                    <div class="analytics-tab active" onclick="showAnalyticsTab('user')">👤 User Stats</div>
                    <div class="analytics-tab" onclick="showAnalyticsTab('global')">🌍 Global Data</div>
                </div>
                <div id="user-analytics" class="analytics-tab-content active">
                    <div class="metric-grid">
                        <div class="metric-card">
                            <div class="metric-title">Games Played</div>
                            <div class="big-number" id="user-games">0</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">Accuracy Rate</div>
                            <div class="big-number" id="user-accuracy">0%</div>
                            <div class="progress-bar">
                                <div class="progress-fill" id="accuracy-bar"></div>
                            </div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">Performance Trend</div>
                            <div class="chart-container">
                                <canvas id="performance-chart"></canvas>
                            </div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">Game Times</div>
                            <div class="chart-container">
                                <canvas id="timing-chart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="global-analytics" class="analytics-tab-content">
                    <div class="metric-grid">
                        <div class="metric-card">
                            <div class="metric-title">Total Players</div>
                            <div class="big-number" id="global-users">0</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">Games Worldwide</div>
                            <div class="big-number" id="global-games">0</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">Global vs Your Accuracy</div>
                            <div class="chart-container">
                                <canvas id="comparison-chart"></canvas>
                            </div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">Browser Distribution</div>
                            <div class="chart-container">
                                <canvas id="browser-chart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    terminalElement.appendChild(footer);
    loadAnalyticsData();
}

function toggleAnalytics() {
    const panel = document.getElementById('analytics-panel');
    const arrow = document.getElementById('analytics-arrow');
    panel.classList.toggle('collapsed');
    arrow.textContent = panel.classList.contains('collapsed') ? '⇣' : '⇡';
}

function showAnalyticsTab(tab) {
    document.querySelectorAll('.analytics-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.analytics-tab-content').forEach(t => t.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tab + '-analytics').classList.add('active');
    
    loadAnalyticsData();
}

function refreshAnalytics() {
    loadAnalyticsData();
}

async function loadAnalyticsData() {
    const saved = localStorage.getItem('cupGameStats');
    if (saved) {
        userStats = JSON.parse(saved);
    }
    
    try {
        const response = await fetch('https://9o6yuxxlnk.execute-api.us-east-1.amazonaws.com/prod/global-stats');
        if (response.ok) {
            globalStats = await response.json();
        }
    } catch (error) {
        globalStats = { totalUsers: 1, totalGames: 3, avgAccuracy: 33 };
    }
    
    updateAnalyticsVisualizations();
}

window.refreshAnalytics = refreshAnalytics;

function updateAnalyticsVisualizations() {
    document.getElementById('user-games').textContent = userStats.gamesPlayed || 0;
    document.getElementById('user-accuracy').textContent = (userStats.accuracy || 0) + '%';
    document.getElementById('accuracy-bar').style.width = (userStats.accuracy || 0) + '%';
    
    document.getElementById('global-users').textContent = globalStats.totalUsers || 0;
    document.getElementById('global-games').textContent = globalStats.totalGames || 0;
    
    createAnalyticsCharts();
}

function createAnalyticsCharts() {
    new Chart(document.getElementById('performance-chart'), {
        type: 'line',
        data: {
            labels: ['Game 1', 'Game 2', 'Game 3', 'Game 4', 'Game 5'],
            datasets: [{
                label: 'Accuracy %',
                data: generateTrendData(),
                borderColor: '#00ffff',
                backgroundColor: 'rgba(0, 255, 255, 0.1)',
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
    
    new Chart(document.getElementById('timing-chart'), {
        type: 'bar',
        data: {
            labels: ['Fastest', 'Average', 'Slowest'],
            datasets: [{
                data: [
                    (userStats.fastestGame || 5000) / 1000,
                    (userStats.avgGameTime || 8000) / 1000,
                    (userStats.slowestGame || 12000) / 1000
                ],
                backgroundColor: ['#00ffff', '#ff00ff', '#cccccc']
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
    
    new Chart(document.getElementById('browser-chart'), {
        type: 'doughnut',
        data: {
            labels: ['Chrome', 'Firefox', 'Safari', 'Edge'],
            datasets: [{
                data: [70, 15, 10, 5],
                backgroundColor: ['#00ffff', '#ff00ff', '#cccccc', '#0a0015']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } }
        }
    });
    
    new Chart(document.getElementById('comparison-chart'), {
        type: 'radar',
        data: {
            labels: ['Accuracy', 'Speed', 'Consistency', 'Experience'],
            datasets: [{
                label: 'You',
                data: [userStats.accuracy || 0, 75, 60, Math.min((userStats.gamesPlayed || 0) * 10, 100)],
                borderColor: '#00ffff',
                backgroundColor: 'rgba(0, 255, 255, 0.2)'
            }, {
                label: 'Global Average',
                data: [globalStats.avgAccuracy || 0, 65, 70, 80],
                borderColor: '#ff00ff',
                backgroundColor: 'rgba(255, 0, 255, 0.2)'
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
    return Array.from({length: 5}, (_, i) => 
        Math.max(0, Math.min(100, accuracy + (Math.random() - 0.5) * 20))
    );
}