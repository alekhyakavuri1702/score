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
const addScoreButton = document.getElementById('addScore');
const historyTableBody = document.getElementById('historyTableBody');
const summaryTableBody = document.getElementById('summaryTableBody');

let playerNames = [];
let gameCounter = 0;
let scores = [];
let perGameScores = [];
let allGames = [];

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

function syncPerGameScoresFromInputs() {
    const rows = tableBody.querySelectorAll('tr');
    perGameScores = [];
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        if (inputs.length > 0) {
            const gameScores = Array.from(inputs).map(input => parseInt(input.value) || 0);
            perGameScores.push(gameScores);
        }
    });
}

function createScoreInput(value, onChange) {
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'score-input';
    input.value = value;
    
    input.addEventListener('input', (e) => {
        const newValue = parseInt(e.target.value) || 0;
        onChange(newValue);
        syncPerGameScoresFromInputs();
        updateScores();
        updateLiveScores();
    });
    return input;
}

function getPlayerNetTotals() {
    const netTotals = Array(playerNames.length).fill(0);
    perGameScores.forEach(gameScores => {
        const totalSum = gameScores.reduce((sum, score) => sum + score, 0);
        gameScores.forEach((score, index) => {
            netTotals[index] += (score === 0 ? totalSum : -score);
        });
    });
    return netTotals;
}

function updateLiveScores() {
    const content = document.getElementById('liveScoresContent');
    if (!content) return;
    content.innerHTML = '';
    const gamesPlayed = perGameScores.length;
    document.getElementById('gamesPlayedCount').textContent = gamesPlayed;
    document.getElementById('totalPointsCount').textContent = perGameScores.reduce((acc, scores) => acc + scores.reduce((a, s) => a + s, 0), 0);

    const netTotals = getPlayerNetTotals();
    const ranking = playerNames.map((name, i) => ({ name, net: netTotals[i] })).sort((a, b) => b.net - a.net);

    ranking.forEach(player => {
        const div = document.createElement('div');
        div.className = 'live-player-score';
        div.innerHTML = `
            <span class="player-name">${player.name}</span>
            <span class="live-total-score ${player.net >= 0 ? 'positive-score' : 'negative-score'}">${player.net}</span>
        `;
        content.appendChild(div);
    });

    renderLiveNetSummary();
}

function renderLiveNetSummary() {
    const container = document.getElementById('liveNetSummary');
    if (!container) return;
    container.innerHTML = '';
    if (playerNames.length === 0 || perGameScores.length === 0) return;

    const table = document.createElement('table');
    table.className = 'live-net-table';
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>Game/Player</th>' + playerNames.map(name => `<th>${name}</th>`).join('');
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const netScores = Array(playerNames.length).fill(0);
    perGameScores.forEach((gameScores, gameIndex) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>Game ${gameIndex + 1}</td>`;
        const totalSum = gameScores.reduce((sum, score) => sum + score, 0);
        gameScores.forEach((score, index) => {
            const net = score === 0 ? totalSum : -score;
            netScores[index] += net;
            const cell = document.createElement('td');
            cell.textContent = net;
            cell.className = net >= 0 ? 'positive-score' : 'negative-score';
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });

    const totalRow = document.createElement('tr');
    totalRow.innerHTML = '<td>Total</td>';
    netScores.forEach(score => {
        const cell = document.createElement('td');
        cell.textContent = score;
        cell.className = score >= 0 ? 'positive-score' : 'negative-score';
        totalRow.appendChild(cell);
    });
    tbody.appendChild(totalRow);
    table.appendChild(tbody);
    container.appendChild(table);
}

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => {
        c.classList.remove('active');
        c.style.display = 'none';
    });
    const tab = document.querySelector(`.tab[data-tab="${tabName}"]`);
    const content = document.getElementById(tabName);
    if (tab && content) {
        tab.classList.add('active');
        content.style.display = 'block';
        content.classList.add('active');
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
    row.innerHTML = `<td class="game-cell">Game ${gameCounter}</td>`;
    const scoresForGame = Array(playerNames.length).fill(0);
    playerNames.forEach((_, index) => {
        const cell = document.createElement('td');
        const input = createScoreInput(0, (val) => {
            scoresForGame[index] = val;
            scores[index] = Array.from(tableBody.querySelectorAll(`tr td:nth-child(${index + 2}) input`)).reduce((acc, input) => acc + (parseInt(input.value) || 0), 0);
        });
        cell.appendChild(input);
        row.appendChild(cell);
    });
    tableBody.appendChild(row);
    syncPerGameScoresFromInputs();
    updateScores();
    updateLiveScores();
    showNotification(`Game ${gameCounter} started!`);
    setTimeout(updateAllTables, 100);
});

function updateScores() {
    totalRow.querySelectorAll('td').forEach((cell, index) => {
        if (index > 0) {
            const score = scores[index - 1];
            cell.textContent = score;
            cell.className = `total-cell pop-total ${score >= 0 ? 'positive-score' : 'negative-score'}`;
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
        row.innerHTML = `<td class="game-cell">Game ${gameIndex + 1}</td>`;
        const totalSum = gameScores.reduce((sum, score) => sum + score, 0);
        gameScores.forEach((score, index) => {
            const net = score === 0 ? totalSum : -score;
            netScores[index] += net;
            const cell = document.createElement('td');
            cell.textContent = net;
            cell.className = net >= 0 ? 'positive-score' : 'negative-score';
            row.appendChild(cell);
        });
        negativeTable.appendChild(row);
    });
    const totalRow = document.createElement('tr');
    totalRow.innerHTML = '<td>Total</td>';
    netScores.forEach(score => {
        const cell = document.createElement('td');
        cell.textContent = score;
        cell.className = score >= 0 ? 'positive-score' : 'negative-score';
        totalRow.appendChild(cell);
    });
    negativeTable.appendChild(totalRow);
    summarySection.classList.remove('hidden');
}

addScoreButton.addEventListener('click', () => {
    syncPerGameScoresFromInputs();
    if (perGameScores.length === 0) return;
    const lastGameScores = perGameScores[perGameScores.length - 1];
    allGames.push({
        scores: [...lastGameScores],
        date: new Date().toLocaleString(),
    });
    updateHistoryTable();
    updateSummaryTable();
    showNotification('Scores added!');
    addGameButton.click();
    switchTab('scores');
});

function updateHistoryTable() {
    historyTableBody.innerHTML = '';
    allGames.forEach((game, gameIdx) => {
        const row = document.createElement('tr');
        const gameCell = document.createElement('td');
        gameCell.textContent = `Game ${gameIdx + 1}`;
        row.appendChild(gameCell);
        const dateCell = document.createElement('td');
        dateCell.textContent = game.date;
        row.appendChild(dateCell);
        game.scores.forEach((score, idx) => {
            const playerCell = document.createElement('td');
            playerCell.textContent = playerNames[idx];
            row.appendChild(playerCell);
            const scoreCell = document.createElement('td');
            scoreCell.textContent = score;
            scoreCell.className = score >= 0 ? 'positive-score' : 'negative-score';
            row.appendChild(scoreCell);
        });
        historyTableBody.appendChild(row);
    });
}

function updateSummaryTable() {
    summaryTableBody.innerHTML = '';
    if (playerNames.length === 0) return;
    const netScores = Array(playerNames.length).fill(0);
    const regularScores = Array(playerNames.length).fill(0);
    const drops = Array(playerNames.length).fill(0);
    const wins = Array(playerNames.length).fill(0);
    const special = Array(playerNames.length).fill(0);
    allGames.forEach(game => {
        const totalSum = game.scores.reduce((a, b) => a + b, 0);
        game.scores.forEach((score, idx) => {
            const net = score === 0 ? totalSum : -score;
            netScores[idx] += net;
            regularScores[idx] += score;
            if (score === 20) drops[idx]++;
            if (score === 0) wins[idx]++;
            if (score >= 70 && score <= 80) special[idx]++;
        });
    });
    playerNames.forEach((name, idx) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${name}</td>
            <td class="${netScores[idx] >= 0 ? 'positive-score' : 'negative-score'}">${netScores[idx]}</td>
            <td>${regularScores[idx]}</td>
            <td>${drops[idx]}</td>
            <td>${wins[idx]}</td>
            <td>${special[idx]}</td>
        `;
        summaryTableBody.appendChild(row);
    });
}

function updateAllTables() {
    updateHistoryTable();
    updateSummaryTable();
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

updateAllTables();
