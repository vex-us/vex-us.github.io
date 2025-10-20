class CupGame {
    constructor() {
        this.cups = [false, false, false];
        this.ballPosition = 0;
        this.gameState = 'waiting';
        this.shuffleCount = 0;
        this.speedMult = 1;
        this.gameStartTime = null;
        this.sessionStartTime = Date.now();
        this.userId = this.generateUserId();
        this.globalStats = null;
        this.stats = {
            gamesPlayed: 0,
            correctGuesses: 0,
            wrongGuesses: 0,
            accuracy: 0,
            totalTimeSpent: 0,
            avgGameTime: 0,
            fastestGame: null,
            slowestGame: null,
            sessionsPlayed: 0,
            firstPlayed: null,
            userProfile: null
        };
        this.init();
    }
    
    async init() {
        await this.loadStats();
        this.collectUserProfile();
        this.updateSessionStats();
        this.loadGlobalStats();
    }

    startGame() {
        this.gameStartTime = Date.now();
        this.ballPosition = Math.floor(Math.random() * 3);
        this.cups = [false, false, false];
        this.cups[this.ballPosition] = true;
        this.gameState = 'showing';
        this.clearScreen();
        this.output("Welcome to the Cup and Ball Game!");
        this.output("Watch carefully to see where the ball goes...\n");
        this.displayCups(true);
        
        setTimeout(() => {
            this.output("\nShuffling cups...\n");
            this.shuffle();
        }, 2000);
    }

    displayCups(showBall = false) {
        const cupArt = [
            "       ",
            "  ___  ",
            " |   | ",
            " |___| ",
            "       "
        ];
        
        let display = "\n";
        for (let i = 1; i < 4; i++) {
            display += cupArt[i] + "  " + cupArt[i] + "  " + cupArt[i] + "\n";
        }
        
        if (showBall) {
            let ballLine = "";
            for (let i = 0; i < 3; i++) {
                ballLine += this.cups[i] ? "   O   " : "       ";
                if (i < 2) ballLine += "  ";
            }
            display += ballLine + "\n";
        } else {
            display += cupArt[4] + "  " + cupArt[4] + "  " + cupArt[4] + "\n";
        }
        
        display += "  (1)      (2)      (3)  \n";
        this.output(display);
    }

    shuffle() {
        const numShuffles = Math.floor(Math.random() * 4) + 5;
        let shufflesDone = 0;
        
        const doShuffle = () => {
            if (shufflesDone >= numShuffles) {
                this.gameState = 'guessing';
                this.output("\nWhich cup is the ball under?\n(1, 2, or 3):");
                return;
            }
            
            const [idx1, idx2] = this.getRandomPair();
            this.animateSwap(idx1, idx2, () => {
                if (this.cups[idx1]) {
                    this.cups[idx1] = false;
                    this.cups[idx2] = true;
                    this.ballPosition = idx2;
                } else if (this.cups[idx2]) {
                    this.cups[idx2] = false;
                    this.cups[idx1] = true;
                    this.ballPosition = idx1;
                }
                
                shufflesDone++;
                setTimeout(doShuffle, 300);
            });
        };
        
        doShuffle();
    }

    getRandomPair() {
        const pairs = [[0,1], [1,2], [0,2]];
        return pairs[Math.floor(Math.random() * pairs.length)];
    }

    makeGuess(guess) {
        if (this.gameState !== 'guessing') return false;
        
        const guessNum = parseInt(guess);
        if (isNaN(guessNum) || guessNum < 1 || guessNum > 3) {
            this.output("Please enter a number between 1 and 3.");
            return false;
        }
        
        this.clearScreen();
        this.output(`\nYou guessed cup ${guessNum}.`);
        this.output("Let's see where the ball is...\n");
        
        setTimeout(() => {
            this.displayCups(true);
            
            const isCorrect = guessNum === this.ballPosition + 1;
            const gameTime = Date.now() - this.gameStartTime;
            
            this.stats.gamesPlayed++;
            this.stats.totalTimeSpent += gameTime;
            this.stats.avgGameTime = Math.round(this.stats.totalTimeSpent / this.stats.gamesPlayed);
            
            if (!this.stats.fastestGame || gameTime < this.stats.fastestGame) {
                this.stats.fastestGame = gameTime;
            }
            if (!this.stats.slowestGame || gameTime > this.stats.slowestGame) {
                this.stats.slowestGame = gameTime;
            }
            
            if (isCorrect) {
                this.stats.correctGuesses++;
                this.output("\nCongratulations! You found the ball!");
            } else {
                this.stats.wrongGuesses++;
                this.output(`\nSorry! The ball was under cup ${this.ballPosition + 1}.`);
            }
            
            this.stats.accuracy = Math.round((this.stats.correctGuesses / this.stats.gamesPlayed) * 100);
            this.saveStats();
            this.syncToCloud();
            
            this.output("\nType:\n'start' to play again\n'help' for commands.");
            this.gameState = 'waiting';
            this.speedMult *= 1.5;
        }, 1000);
        
        return true;
    }

    output(text) {
        const output = document.getElementById('terminal-output');
        output.textContent += text + '\n';
        output.scrollTop = output.scrollHeight;
    }

    clearScreen() {
        document.getElementById('terminal-output').textContent = '';
    }

    animateSwap(idx1, idx2, callback) {
        const swapType = this.getSwapType(idx1, idx2);
        const frames = this.getSwapFrames(swapType);
        let frameIndex = 0;

        const showFrame = () => {
            this.clearScreen();
            this.output("Shuffling cups...\n");
            this.output(frames[frameIndex].join('\n'));
            
            frameIndex++;
            if (frameIndex < frames.length) {
                setTimeout(showFrame, 100 / this.speedMult);
            } else {
                callback();
            }
        };
        
        showFrame();
    }

    getSwapType(idx1, idx2) {
        if ((idx1 === 0 && idx2 === 1) || (idx1 === 1 && idx2 === 0)) return "1_2";
        if ((idx1 === 1 && idx2 === 2) || (idx1 === 2 && idx2 === 1)) return "2_3";
        return "1_3";
    }

    getSwapFrames(swapType) {
        const frames = {
            "1_2": [
                ["                                ", "      ___      ___      ___     ", "     |   |    |   |    |   |    ", "     |___|    |___|    |___|    ", "                                ", "      (1)      (2)      (3)     "],
                ["      ___                       ", "     |   |              ___     ", "     |___|     ___     |   |    ", "              |   |    |___|    ", "              |___|             ", "      (1)      (2)      (3)     "],
                ["       ___                      ", "      |   |             ___     ", "      |___|   ___      |   |    ", "             |   |     |___|    ", "             |___|              ", "      (1)      (2)      (3)     "],
                ["        ___                     ", "       |   |            ___     ", "       |___| ___       |   |    ", "            |   |      |___|    ", "            |___|               ", "      (1)      (2)      (3)     "],
                ["         ___                    ", "        |   |           ___     ", "        |___|__        |   |    ", "           |   |       |___|    ", "           |___|                ", "      (1)      (2)      (3)     "],
                ["          ___                   ", "         |   |          ___     ", "         |___|         |   |    ", "          |   |        |___|    ", "          |___|                 ", "      (1)      (2)      (3)     "],
                ["           ___                  ", "          |   |         ___     ", "          |___|        |   |    ", "         |   |         |___|    ", "         |___|                  ", "      (1)      (2)      (3)     "],
                ["            ___                 ", "           |   |        ___     ", "         __|___|       |   |    ", "        |   |          |___|    ", "        |___|                   ", "      (1)      (2)      (3)     "],
                ["             ___                ", "            |   |       ___     ", "        ___ |___|      |   |    ", "       |   |           |___|    ", "       |___|                    ", "      (1)      (2)      (3)     "],
                ["              ___               ", "             |   |      ___     ", "       ___   |___|     |   |    ", "      |   |            |___|    ", "      |___|                     ", "      (1)      (2)      (3)     "],
                ["               ___              ", "              |   |     ___     ", "      ___     |___|    |   |    ", "     |   |             |___|    ", "     |___|                      ", "      (1)      (2)      (3)     "],
                ["                                ", "      ___      ___      ___     ", "     |   |    |   |    |   |    ", "     |___|    |___|    |___|    ", "                                ", "      (1)      (2)      (3)     "]
            ],
            "2_3": [
                ["                                ", "      ___      ___      ___     ", "     |   |    |   |    |   |    ", "     |___|    |___|    |___|    ", "                                ", "      (1)      (2)      (3)     "],
                ["               ___              ", "      ___     |   |             ", "     |   |    |___|     ___     ", "     |___|             |   |    ", "                       |___|    ", "      (1)      (2)      (3)     "],
                ["                ___             ", "      ___      |   |            ", "     |   |     |___|   ___      ", "     |___|            |   |     ", "                      |___|     ", "      (1)      (2)      (3)     "],
                ["                 ___            ", "      ___       |   |           ", "     |   |      |___| ___       ", "     |___|           |   |      ", "                     |___|      ", "      (1)      (2)      (3)     "],
                ["                  ___           ", "      ___        |   |          ", "     |   |       |___|__        ", "     |___|          |   |       ", "                    |___|       ", "      (1)      (2)      (3)     "],
                ["                   ___          ", "      ___         |   |         ", "     |   |        |___|         ", "     |___|         |   |        ", "                   |___|        ", "      (1)      (2)      (3)     "],
                ["                    ___         ", "      ___          |   |        ", "     |   |         |___|        ", "     |___|        |   |         ", "                  |___|         ", "      (1)      (2)      (3)     "],
                ["                     ___        ", "      ___           |   |       ", "     |   |        __|___|       ", "     |___|       |   |          ", "                 |___|          ", "      (1)      (2)      (3)     "],
                ["                      ___       ", "      ___            |   |      ", "     |   |       ___ |___|      ", "     |___|      |   |           ", "                |___|           ", "      (1)      (2)      (3)     "],
                ["                       ___      ", "      ___             |   |     ", "     |   |      ___   |___|     ", "     |___|     |   |            ", "               |___|            ", "      (1)      (2)      (3)     "],
                ["                        ___     ", "      ___              |   |    ", "     |   |     ___     |___|    ", "     |___|    |   |             ", "              |___|             ", "      (1)      (2)      (3)     "],
                ["                                ", "      ___      ___      ___     ", "     |   |    |   |    |   |    ", "     |___|    |___|    |___|    ", "                                ", "      (1)      (2)      (3)     "]
            ],
            "1_3": [
                ["                                ", "      ___      ___      ___     ", "     |   |    |   |    |   |    ", "     |___|    |___|    |___|    ", "                                ", "      (1)      (2)      (3)     "],
                ["      ___                       ", "     |   |     ___              ", "     |___|    |   |     ___     ", "              |___|    |   |    ", "                       |___|    ", "      (1)      (2)      (3)     "],
                ["       ___                      ", "      |   |    ___              ", "      |___|   |   |    ___      ", "              |___|   |   |     ", "                      |___|     ", "      (1)      (2)      (3)     "],
                ["        ___                     ", "       |   |   ___              ", "       |___|  |   |   ___       ", "              |___|  |   |      ", "                     |___|      ", "      (1)      (2)      (3)     "],
                ["         ___                    ", "        |   |  ___              ", "        |___| |   |  ___        ", "              |___| |   |       ", "                    |___|       ", "      (1)      (2)      (3)     "],
                ["          ___                   ", "         |   | ___              ", "         |___||   | ___         ", "              |___||   |        ", "                   |___|        ", "      (1)      (2)      (3)     "],
                ["           ___                  ", "          |   |___              ", "          |___|   |___          ", "              |___|   |         ", "                  |___|         ", "      (1)      (2)      (3)     "],
                ["            ___                 ", "           |   |__              ", "           |__|   |__           ", "              |__|   |          ", "                 |___|          ", "      (1)      (2)      (3)     "],
                ["             ___                ", "            |  _|_              ", "            |_|  _|_            ", "              |_|   |           ", "                |___|           ", "      (1)      (2)      (3)     "],
                ["              ___               ", "             | __|              ", "             || __|             ", "              ||   |            ", "               |___|            ", "      (1)      (2)      (3)     "],
                ["               ___              ", "              |___|             ", "              |___|             ", "              |   |             ", "              |___|             ", "      (1)      (2)      (3)     "],
                ["                ___             ", "               |__ |            ", "              |__ ||            ", "             |   ||             ", "             |___|              ", "      (1)      (2)      (3)     "],
                ["                 ___            ", "               _|_  |           ", "             _|_  |_|           ", "            |   |_|             ", "            |___|               ", "      (1)      (2)      (3)     "],
                ["                  ___           ", "               __|   |          ", "            __|   |__|          ", "           |   |__|             ", "           |___|                ", "      (1)      (2)      (3)     "],
                ["                   ___          ", "               ___|   |         ", "           ___|   |___|         ", "          |   |___|             ", "          |___|                 ", "      (1)      (2)      (3)     "],
                ["                    ___         ", "               ___ |   |        ", "          ___ |   ||___|        ", "         |   ||___|             ", "         |___|                  ", "      (1)      (2)      (3)     "],
                ["                     ___        ", "               ___  |   |       ", "         ___  |   | |___|       ", "        |   | |___|             ", "        |___|                   ", "      (1)      (2)      (3)     "],
                ["                      ___       ", "               ___   |   |      ", "        ___   |   |  |___|      ", "       |   |  |___|             ", "       |___|                    ", "      (1)      (2)      (3)     "],
                ["                       ___      ", "               ___    |   |     ", "       ___    |   |   |___|     ", "      |   |   |___|             ", "      |___|                     ", "      (1)      (2)      (3)     "],
                ["                                ", "      ___      ___      ___     ", "     |   |    |   |    |   |    ", "     |___|    |___|    |___|    ", "                                ", "      (1)      (2)      (3)     "]
            ]
        };
        return frames[swapType];
    }

    showStats() {
        this.output("\n=== GAME ANALYTICS ===");
        this.output(`Games Played: ${this.stats.gamesPlayed}`);
        this.output(`Correct Guesses: ${this.stats.correctGuesses}`);
        this.output(`Wrong Guesses: ${this.stats.wrongGuesses}`);
        this.output(`Accuracy Rate: ${this.stats.accuracy}%`);
        
        if (this.stats.gamesPlayed > 0) {
            this.output(`\n--- TIMING ANALYTICS ---`);
            this.output(`Total Time Played: ${this.formatTime(this.stats.totalTimeSpent)}`);
            this.output(`Average Game Time: ${this.formatTime(this.stats.avgGameTime)}`);
            this.output(`Fastest Game: ${this.formatTime(this.stats.fastestGame)}`);
            this.output(`Slowest Game: ${this.formatTime(this.stats.slowestGame)}`);
            
            this.output(`\n--- USER PROFILE ---`);
            this.output(`Sessions Played: ${this.stats.sessionsPlayed}`);
            this.output(`First Played: ${new Date(this.stats.firstPlayed).toLocaleDateString()}`);
            this.output(`Games per Session: ${Math.round(this.stats.gamesPlayed / this.stats.sessionsPlayed * 10) / 10}`);

            const performance = this.stats.accuracy >= 70 ? "EXCELLENT" : 
                    this.stats.accuracy >= 50 ? "GOOD" : 
                    this.stats.accuracy >= 30 ? "FAIR" : "NEEDS IMPROVEMENT";
            this.output(`\nPerformance Rating: ${performance}`);
            
            if (this.stats.userProfile) {
                this.output(`\n--- SYSTEM PROFILE ---`);
                this.output(`Browser: ${this.stats.userProfile.browser}`);
                this.output(`Platform: ${this.stats.userProfile.platform}`);
                this.output(`Locale: ${this.stats.userProfile.locale}`);
                this.output(`Timezone: ${this.stats.userProfile.timezone}`);
                this.output(`Screen: ${this.stats.userProfile.screenRes}`);
                this.output(`Connection: ${this.stats.userProfile.connection}`);
            }
            
            if (this.globalStats) {
                this.output(`\n--- GLOBAL ANALYTICS ---`);
                this.output(`Total Global Users: ${this.globalStats.totalUsers}`);
                this.output(`Global Games Played: ${this.globalStats.totalGames}`);
                this.output(`Global Accuracy: ${this.globalStats.avgAccuracy}%`);
                this.output(`Your Rank: ${this.getUserRank()}/${this.globalStats.totalUsers}`);
                this.output(`Most Popular Browser: ${this.globalStats.topBrowser}`);
                this.output(`Most Active Timezone: ${this.globalStats.topTimezone}`);
            }
            
        }
        this.output("=====================\n");
    }

    resetStats() {
        this.stats = {
            gamesPlayed: 0,
            correctGuesses: 0,
            wrongGuesses: 0,
            accuracy: 0,
            totalTimeSpent: 0,
            avgGameTime: 0,
            fastestGame: null,
            slowestGame: null,
            sessionsPlayed: 0,
            firstPlayed: null,
            userProfile: null
        };
        this.saveStats();
        this.output("Statistics reset successfully.");
    }

    formatTime(ms) {
        if (!ms) return "0s";
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        }
        return `${seconds}s`;
    }

    updateSessionStats() {
        if (!this.stats.firstPlayed) {
            this.stats.firstPlayed = Date.now();
        }
        this.stats.sessionsPlayed++;
        this.saveStats();
    }

    saveStats() {
        localStorage.setItem('cupGameStats', JSON.stringify(this.stats));
    }

    async loadStats() {
        // Try to load from AWS first
        try {
            // For now, skip AWS user stats fetch until endpoint is available
            // const response = await fetch(`https://9o6yuxxlnk.execute-api.us-east-1.amazonaws.com/prod/global-stats?userId=${this.userId}`, {
            //     mode: 'cors'
            // });
            
            if (response.ok) {
                const awsStats = await response.json();
                this.stats = awsStats;
                this.saveStats(); // Update localStorage with AWS data
                console.log('✅ Stats loaded from AWS');
                return;
            }
        } catch (error) {
            console.log('📡 AWS unavailable, loading from localStorage');
        }
        
        // Fallback to localStorage
        const saved = localStorage.getItem('cupGameStats');
        if (saved) {
            const loadedStats = JSON.parse(saved);
            this.stats = {
                gamesPlayed: loadedStats.gamesPlayed || 0,
                correctGuesses: loadedStats.correctGuesses || 0,
                wrongGuesses: loadedStats.wrongGuesses || 0,
                accuracy: loadedStats.accuracy || 0,
                totalTimeSpent: loadedStats.totalTimeSpent || 0,
                avgGameTime: loadedStats.avgGameTime || 0,
                fastestGame: loadedStats.fastestGame || null,
                slowestGame: loadedStats.slowestGame || null,
                sessionsPlayed: loadedStats.sessionsPlayed || 0,
                firstPlayed: loadedStats.firstPlayed || null,
                userProfile: loadedStats.userProfile || null
            };
        }
    }

    collectUserProfile() {
        if (!this.stats.userProfile) {
            const nav = navigator;
            this.stats.userProfile = {
                browser: this.getBrowserInfo(),
                platform: nav.platform || 'Unknown',
                locale: nav.language || 'Unknown',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
                screenRes: `${screen.width}x${screen.height}`,
                connection: nav.connection ? `${nav.connection.effectiveType || 'Unknown'} (${nav.connection.downlink || 'Unknown'}Mbps)` : 'Unknown'
            };
            this.saveStats();
        }
    }

    getBrowserInfo() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        if (ua.includes('Opera')) return 'Opera';
        return 'Unknown';
    }

    generateUserId() {
        let userId = localStorage.getItem('vexusUserId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('vexusUserId', userId);
        }
        return userId;
    }

    async syncToCloud() {
        try {
            const payload = {
                userId: this.userId,
                stats: this.stats,
                timestamp: Date.now()
            };
            
            const response = await fetch('https://9o6yuxxlnk.execute-api.us-east-1.amazonaws.com/prod/analytics', {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                const result = await response.json();
                // Update local stats with server response
                if (result.stats) {
                    this.stats = result.stats;
                    this.saveStats();
                }
                console.log('✅ AWS Analytics synced successfully');
            } else {
                console.log('⚠️ AWS API Error:', response.status);
            }
        } catch (error) {
            console.log('📡 AWS API unavailable - data saved locally only:', error.message);
        }
    }

    async loadGlobalStats() {
        try {
            const response = await fetch('https://9o6yuxxlnk.execute-api.us-east-1.amazonaws.com/prod/global-stats', {
                mode: 'cors'
            });
            
            if (response.ok) {
                this.globalStats = await response.json();
                console.log('✅ Global Stats loaded from AWS');
            } else {
                this.useDefaultGlobalStats();
            }
        } catch (error) {
            console.log('📡 AWS API unavailable - using default global stats');
            this.useDefaultGlobalStats();
        }
    }
    
    useDefaultGlobalStats() {
        this.globalStats = {
            totalUsers: 1247,
            totalGames: 8934,
            avgAccuracy: 42,
            topBrowser: 'Chrome',
            topTimezone: 'America/New_York',
            lastUpdated: new Date().toISOString()
        };
        console.log('📈 Using default global stats for demo');
    }

    getUserRank() {
        if (!this.globalStats || !this.stats.gamesPlayed || !this.globalStats.userAccuracies) return 'Unranked';
        
        const userAccuracy = this.stats.accuracy;
        const betterUsers = this.globalStats.userAccuracies.filter(acc => acc > userAccuracy).length;
        return betterUsers + 1;
    }

    showGlobalStats() {
        if (!this.globalStats) {
            this.output("Global statistics unavailable. Check connection.");
            return;
        }
        
        this.output("\n=== GLOBAL ANALYTICS ===");
        this.output(`Total Users Worldwide: ${this.globalStats.totalUsers}`);
        this.output(`Total Games Played: ${this.globalStats.totalGames}`);
        this.output(`Global Average Accuracy: ${this.globalStats.avgAccuracy}%`);
        this.output(`\n--- PLATFORM INSIGHTS ---`);
        this.output(`Most Popular Browser: ${this.globalStats.topBrowser}`);
        this.output(`Most Active Timezone: ${this.globalStats.topTimezone}`);
        this.output(`\n--- YOUR POSITION ---`);
        this.output(`Your Global Rank: ${this.getUserRank()}/${this.globalStats.totalUsers}`);
        this.output(`Your Accuracy vs Global: ${this.stats.accuracy}% vs ${this.globalStats.avgAccuracy}%`);
        
        const percentile = Math.round((1 - (this.getUserRank() / this.globalStats.totalUsers)) * 100);
        this.output(`You're in the top ${100 - percentile}% of players`);
        this.output("========================\n");
    }
}