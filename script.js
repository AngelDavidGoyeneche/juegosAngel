let balance = 1000000;
let currentGame = null;

function updateBalance(amount) {
    balance += amount;
    const balanceElement = document.getElementById('balance');
    balanceElement.textContent = `Saldo: $${balance.toLocaleString()} COP`;
    balanceElement.classList.add('shake');
    setTimeout(() => balanceElement.classList.remove('shake'), 500);
}

function placeBet(maxBet = balance) {
    let bet = parseInt(prompt(`Ingrese su apuesta (máximo $${maxBet.toLocaleString()} COP):`));
    while (isNaN(bet) || bet <= 0 || bet > maxBet) {
        bet = parseInt(prompt(`Apuesta inválida. Ingrese un valor entre 1 y ${maxBet.toLocaleString()} COP:`));
    }
    updateBalance(-bet);
    return bet;
}

// Blackjack 
function getRandomCard() {
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const suits = ['♠', '♥', '♦', '♣'];
    const value = values[Math.floor(Math.random() * values.length)];
    const suit = suits[Math.floor(Math.random() * suits.length)];
    return { value, suit };
}

function calculateScore(cards) {
    let score = 0;
    let aces = 0;
    
    cards.forEach(card => {
        if (card.value === 'A') {
            aces++;
            score += 11;
        } else if (['J', 'Q', 'K'].includes(card.value)) {
            score += 10;
        } else {
            score += parseInt(card.value) || 10;
        }
    });

    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    
    return score;
}

function renderCard(card, hidden = false) {
    const isRed = ['♥', '♦'].includes(card.suit);
    return `
        <div class="card ${isRed ? 'red' : ''}" ${hidden ? 'style="background: #778da9"' : ''}>
            ${hidden ? '?' : `${card.value}${card.suit}`}
        </div>
    `;
}

function startBlackjack() {
    currentGame = {
        type: 'blackjack',
        bet: placeBet(),
        playerCards: [getRandomCard(), getRandomCard()],
        dealerCards: [getRandomCard(), getRandomCard()]
    };

    renderBlackjack();
}

function renderBlackjack() {
    const { bet, playerCards, dealerCards } = currentGame;
    const playerScore = calculateScore(playerCards);
    
    let gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <h3>Black Jack - Apuesta: $${bet.toLocaleString()} COP</h3>
        <div>
            <h4>Tus cartas (${playerScore})</h4>
            <div>${playerCards.map(card => renderCard(card)).join('')}</div>
        </div>
        <div>
            <h4>Cartas del crupier</h4>
            <div>
                ${renderCard(dealerCards[0])}
                ${renderCard(dealerCards[1], true)}
            </div>
        </div>
        <div class="bet-options">
            <button onclick="hitBlackjack()">Pedir carta</button>
            <button onclick="standBlackjack()">Plantarse</button>
        </div>
        <div id="result"></div>
    `;
}

function hitBlackjack() {
    currentGame.playerCards.push(getRandomCard());
    const score = calculateScore(currentGame.playerCards);
    
    if (score > 21) {
        document.getElementById('result').innerHTML = `
            <span style="color: var(--lose-color)">
                ¡Te has pasado! Pierdes $${currentGame.bet.toLocaleString()} COP
            </span>
        `;
        document.querySelectorAll('#gameArea button').forEach(btn => btn.disabled = true);
    }
    
    renderBlackjack();
}

function standBlackjack() {
    let dealerScore = calculateScore(currentGame.dealerCards);
    const playerScore = calculateScore(currentGame.playerCards);
    
    while (dealerScore < 17) {
        currentGame.dealerCards.push(getRandomCard());
        dealerScore = calculateScore(currentGame.dealerCards);
    }

    let resultText = '';
    if (dealerScore > 21 || playerScore > dealerScore) {
        const winAmount = playerScore === 21 && currentGame.playerCards.length === 2 ? 
            currentGame.bet * 2.5 : currentGame.bet * 2;
        resultText = `
            <span style="color: var(--win-color)">
                ¡Ganaste! Recibes $${winAmount.toLocaleString()} COP
            </span>
        `;
        updateBalance(winAmount);
    } else if (playerScore === dealerScore) {
        resultText = `
            <span style="color: var(--accent-color)">
                Empate. Recuperas $${currentGame.bet.toLocaleString()} COP
            </span>
        `;
        updateBalance(currentGame.bet);
    } else {
        resultText = `
            <span style="color: var(--lose-color)">
                El crupier gana. Pierdes $${currentGame.bet.toLocaleString()} COP
            </span>
        `;
    }

    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <h3>Black Jack - Apuesta: $${currentGame.bet.toLocaleString()} COP</h3>
        <div>
            <h4>Tus cartas (${playerScore})</h4>
            <div>${currentGame.playerCards.map(card => renderCard(card)).join('')}</div>
        </div>
        <div>
            <h4>Cartas del crupier (${dealerScore})</h4>
            <div>${currentGame.dealerCards.map(card => renderCard(card)).join('')}</div>
        </div>
        <div id="result">${resultText}</div>
        <button onclick="startBlackjack()">Jugar de nuevo</button>
    `;
}

// Campo Minado 
function startMinas() {
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <h3>Campo Minado</h3>
        <div class="mines-config">
            <label>Número de minas:</label>
            <select id="mineCount" class="mine-select">
                <option value="1">1 Mina (x1.2 por casilla)</option>
                <option value="3" selected>3 Minas (x1.5 por casilla)</option>
                <option value="5">5 Minas (x2.0 por casilla)</option>
                <option value="8">8 Minas (x3.0 por casilla)</option>
            </select>
            <button onclick="initializeMineGame()">Comenzar Juego</button>
        </div>
    `;
}

function initializeMineGame() {
    const mineCount = parseInt(document.getElementById('mineCount').value);
    const gridSize = 5;
    const bet = placeBet();
    
    // Calculate multiplier based on mine count
    const multipliers = {
        1: 1.2,
        3: 1.5,
        5: 2.0,
        8: 3.0
    };
    
    currentGame = {
        type: 'minas',
        bet,
        mineCount,
        multiplier: multipliers[mineCount],
        grid: Array(gridSize * gridSize).fill(false),
        revealed: Array(gridSize * gridSize).fill(false),
        currentMultiplier: 1,
        isGameOver: false
    };

    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
        const position = Math.floor(Math.random() * (gridSize * gridSize));
        if (!currentGame.grid[position]) {
            currentGame.grid[position] = true;
            minesPlaced++;
        }
    }

    renderMineGame();
}

function renderMineGame() {
    const { bet, mineCount, currentMultiplier, isGameOver, revealed } = currentGame;
    const potentialWin = Math.floor(bet * currentMultiplier);

    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <h3>Campo Minado - Apuesta: $${bet.toLocaleString()} COP</h3>
        <div class="game-info">
            <p>Minas: ${mineCount} | Multiplicador actual: x${currentMultiplier.toFixed(2)}</p>
            <p>Ganancia potencial: $${potentialWin.toLocaleString()} COP</p>
        </div>
        <div class="mine-grid">
            ${currentGame.grid.map((isMine, index) => `
                <div class="mine-cell ${revealed[index] ? (isMine ? 'mine' : 'safe') : ''}"
                     onclick="revealCell(${index})"
                     ${revealed[index] || isGameOver ? 'disabled' : ''}>
                    ${revealed[index] ? (isMine ? '💣' : '✨') : '?'}
                </div>
            `).join('')}
        </div>
        ${!isGameOver ? `
            <button onclick="cashOutMines()">
                Cobrar $${potentialWin.toLocaleString()} COP
            </button>
        ` : `
            <button onclick="startMinas()">Jugar de nuevo</button>
        `}
        <div id="result"></div>
    `;
}

function revealCell(index) {
    if (currentGame.isGameOver || currentGame.revealed[index]) return;

    currentGame.revealed[index] = true;
    
    if (currentGame.grid[index]) {
        // Hit a mine
        currentGame.isGameOver = true;
        document.getElementById('result').innerHTML = `
            <span style="color: var(--lose-color)">
                ¡BOOM! Perdiste $${currentGame.bet.toLocaleString()} COP
            </span>
        `;
        // Reveal all mines
        currentGame.revealed = currentGame.grid.map(() => true);
    } else {
        // Safe cell
        currentGame.currentMultiplier *= currentGame.multiplier;
        const safeSquaresLeft = currentGame.grid.filter(cell => !cell).length - 
            currentGame.revealed.filter((revealed, i) => revealed && !currentGame.grid[i]).length;
        
        if (safeSquaresLeft === 0) {
            cashOutMines();
        }
    }
    
    renderMineGame();
}

function cashOutMines() {
    const winAmount = Math.floor(currentGame.bet * currentGame.currentMultiplier);
    updateBalance(winAmount);
    currentGame.isGameOver = true;
    document.getElementById('result').innerHTML = `
        <span style="color: var(--win-color)">
            ¡Felicidades! Ganaste $${winAmount.toLocaleString()} COP
        </span>
    `;
    renderMineGame();
}

