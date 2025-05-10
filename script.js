const numPlayersInput = document.getElementById('numPlayers');
const setupPlayersButton = document.getElementById('setupPlayers');
const playerSetupDiv = document.getElementById('player-setup');
const playerNamesDiv = document.getElementById('player-names');
const nameInputsDiv = document.getElementById('nameInputs');
const generateTableButton = document.getElementById('generateTable');
const scoreTableDiv = document.getElementById('score-table');
const tableHeader = document.getElementById('tableHeader');
const tableBody = document.getElementById('tableBody');
const totalRow = document.getElementById('totalRow');
const addGameButton = document.getElementById('addGame');
const summarySection = document.getElementById('summarySection');
const regularTable = document.getElementById('regularTable');
const negativeTable = document.getElementById('negativeTable');

let playerNames = [];
let gameCounter = 0;
let scores = [];
let perGameScores = [];
let previousScores = [];

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'score-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 2000);
}

function updateScoreCell(cell, value) {
    cell.classList.add('updated');
    cell.textContent = value;
    setTimeout(() => cell.classList.remove('updated'), 500);
}

function createScoreInput(value, onChange) {
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'score-input';
    input.value = value;
    
    input.addEventListener('input', (e) => {
        const newValue = parseInt(e.target.value) || 0;
        onChange(newValue);
        updateLiveScores();
    });
    
    input.addEventListener('change', (e) => {
        const newValue = parseInt(e.target.value) || 0;
        onChange(newValue);
        updateLiveScores();
    });
    
    return input;
}

function calculateNetScores(gameScores) {
    const totalSum = gameScores.reduce((sum, score) => sum + score, 0);
    return gameScores.map(score => score === 0 ? totalSum : -score);
}

function updateLiveScores() {
    const content = document.getElementById('liveScoresContent');
    content.innerHTML = '';

    // Update games played and total points
    const gamesPlayedCount = document.getElementById('gamesPlayedCount');
    const totalPointsCount = document.getElementById('totalPointsCount');
    gamesPlayedCount.textContent = perGameScores.length;
    let totalPoints = 0;
    perGameScores.forEach(gameScores => {
        totalPoints += gameScores.reduce((sum, score) => sum + score, 0);
    });
    totalPointsCount.textContent = totalPoints;

    const currentGameScores = perGameScores[perGameScores.length - 1] || Array(playerNames.length).fill(0);
    const netScores = calculateNetScores(currentGameScores);

    playerNames.forEach((name, index) => {
        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'live-player-score';
        const netScore = netScores[index];
        const netScoreClass = netScore >= 0 ? 'positive-score' : 'negative-score';

        scoreDiv.innerHTML = `
            <span class="player-name">${name}</span>
            <span class="live-total-score ${netScoreClass}" style="margin-left: 10px; padding: 6px 16px; display: inline-block;">${netScore}</span>
        `;
        content.appendChild(scoreDiv);

        const scoreSpan = scoreDiv.querySelector('.live-total-score');
        scoreSpan.classList.add('updated');
        setTimeout(() => scoreSpan.classList.remove('updated'), 500);
    });

    const gameIndicator = document.getElementById('gameIndicator');
    if (gameCounter > 0) {
        gameIndicator.textContent = `Game ${gameCounter}`;
    }
}

setupPlayersButton.addEventListener('click', () => {
    const numPlayers = parseInt(numPlayersInput.value);
    if (numPlayers > 0) {
        nameInputsDiv.innerHTML = '';
        for (let i = 0; i < numPlayers; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Player ${i + 1} Name`;
            input.required = true;
            nameInputsDiv.appendChild(input);
        }
        playerSetupDiv.classList.add('hidden');
        playerNamesDiv.classList.remove('hidden');
    } else {
        alert('Please enter a valid number of players.');
    }
});

generateTableButton.addEventListener('click', () => {
    const nameInputs = nameInputsDiv.querySelectorAll('input');
    playerNames = Array.from(nameInputs).map(input => input.value || 'Player');
    scores = Array(playerNames.length).fill(0);

    tableHeader.innerHTML = '<th>Game</th>';
    playerNames.forEach(name => {
        const th = document.createElement('th');
        th.textContent = name;
        tableHeader.appendChild(th);

        const totalCell = document.createElement('td');
        totalCell.textContent = 0;
        totalRow.appendChild(totalCell);
    });

    tableBody.innerHTML = '';
    playerNamesDiv.classList.add('hidden');
    scoreTableDiv.classList.remove('hidden');
    document.querySelector('.tab[data-tab="scores"]').click();
    updateLiveScores();
});

addGameButton.addEventListener('click', () => {
    gameCounter++;
    const row = document.createElement('tr');
    const gameCell = document.createElement('td');
    gameCell.textContent = `Game ${gameCounter}`;
    gameCell.className = 'game-cell';
    row.appendChild(gameCell);

    const gameScores = Array(playerNames.length).fill(0);

    playerNames.forEach((_, index) => {
        const scoreCell = document.createElement('td');
        const scoreInput = createScoreInput(0, (newValue) => {
            gameScores[index] = newValue;
            scores[index] = Array.from(
                tableBody.querySelectorAll(`tr td:nth-child(${index + 2}) input`)
            ).reduce((sum, input) => sum + (parseInt(input.value) || 0), 0);
            updateScores();
        });
        scoreCell.appendChild(scoreInput);
        row.appendChild(scoreCell);
    });

    tableBody.appendChild(row);
    perGameScores.push(gameScores);
    updateScores();
    showNotification(`Game ${gameCounter} started!`);
});

function updateScores() {
    totalRow.querySelectorAll('td').forEach((cell, index) => {
        if (index > 0) {
            const newScore = scores[index - 1];
            cell.textContent = newScore;
            cell.className = `total-cell pop-total ${newScore >= 0 ? 'positive-score' : 'negative-score'}`;
        }
    });

    updateSummary();
    updateLiveScores();
}

function updateSummary() {
    regularTable.innerHTML = '<tr><th>Player</th><th>Total Score</th></tr>';
    playerNames.forEach((name, index) => {
        const row = document.createElement('tr');
        const score = scores[index];
        const scoreClass = score >= 0 ? 'positive-score' : 'negative-score';
        
        row.innerHTML = `
            <td class="player-name">${name}</td>
            <td class="total-cell ${scoreClass}">${score}</td>
        `;
        regularTable.appendChild(row);
    });

    negativeTable.innerHTML = '<tr><th>Game/Player</th></tr>';
    const netScores = Array(playerNames.length).fill(0);

    playerNames.forEach(name => {
        const th = document.createElement('th');
        th.textContent = name;
        negativeTable.querySelector('tr').appendChild(th);
    });

    perGameScores.forEach((gameScores, gameIndex) => {
        const row = document.createElement('tr');
        const gameCell = document.createElement('td');
        gameCell.textContent = `Game ${gameIndex + 1}`;
        gameCell.className = 'game-cell';
        row.appendChild(gameCell);

        const totalSum = gameScores.reduce((sum, score) => sum + score, 0);

        gameScores.forEach((score, playerIndex) => {
            const netScore = score === 0 ? totalSum : -score;
            netScores[playerIndex] += netScore;

            const cell = document.createElement('td');
            cell.textContent = netScore;
            cell.className = netScore >= 0 ? 'positive-score' : 'negative-score';
            row.appendChild(cell);
        });

        negativeTable.appendChild(row);
    });

    const totalRow = document.createElement('tr');
    const totalCell = document.createElement('td');
    totalCell.textContent = 'Total';
    totalCell.className = 'game-cell';
    totalRow.appendChild(totalCell);

    netScores.forEach((total) => {
        const cell = document.createElement('td');
        cell.textContent = total;
        cell.className = total >= 0 ? 'positive-score' : 'negative-score';
        totalRow.appendChild(cell);
    });

    negativeTable.appendChild(totalRow);
    summarySection.classList.remove('hidden');
}

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => {
            c.classList.remove('active');
            c.style.display = 'none';
        });
        
        tab.classList.add('active');
        const content = document.getElementById(tab.dataset.tab);
        content.style.display = 'block';
        content.classList.add('active');
    });
}); 