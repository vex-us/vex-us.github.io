class CupGame {
    constructor() {
        this.cups = [false, false, false];
        this.ballPosition = 0;
        this.gameState = 'waiting';
        this.shuffleCount = 0;
        this.speedMult = 1;
    }

    startGame() {
        this.ballPosition = Math.floor(Math.random() * 3);
        this.cups = [false, false, false];
        this.cups[this.ballPosition] = true;
        this.gameState = 'showing';
        
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
            
            if (guessNum === this.ballPosition + 1) {
                this.output("\nCongratulations! You found the ball!");
            } else {
                this.output(`\nSorry! The ball was under cup ${this.ballPosition + 1}.`);
            }
            
            this.output("\nType:\n'start' to play again\n'help' for commands.");
            this.gameState = 'waiting';
            this.speedMult *= 1.2;
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
}