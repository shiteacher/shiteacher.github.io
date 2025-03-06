const icons = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
    '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦄'];

const chemicals = {
    "单质": {
        "氢气": "H₂", "氮气": "N₂", "氯气": "Cl₂", "氧气": "O₂",
        "碳": "C", "硅": "Si", "硫": "S", "磷": "P", "铁": "Fe",
        "铜": "Cu", "银": "Ag", "钾": "K", "钙": "Ca", "钠": "Na",
        "镁": "Mg", "铝": "Al", "锌": "Zn"
    },
    "氧化物": {
        "水": "H₂O", "三氧化硫": "SO₃", "一氧化碳": "CO",
        "二氧化碳": "CO₂", "五氧化二磷": "P₂O₅", "过氧化氢": "H₂O₂",
        "氧化铜": "CuO", "二氧化硫": "SO₂", "氧化钙": "CaO",
        "氧化亚铁": "FeO", "氧化铁": "Fe₂O₃", "四氧化三铁": "Fe₃O₄",
        "氧化镁": "MgO", "氧化铝": "Al₂O₃", "二氧化锰": "MnO₂"
    },
    "化合物": {
        "硝酸": "HNO₃", "硫酸": "H₂SO₄", "盐酸": "HCl", "碳酸": "H₂CO₃",
        "氢氧化钠": "NaOH", "氢氧化钙": "Ca(OH)₂", "氨水": "NH₯·H₂O",
        "氯化钠": "NaCl", "硫酸铜": "CuSO₄", "高锰酸钾": "KMnO₄",
        "碳酸钙": "CaCO₃", "硝酸银": "AgNO₃", "硫酸亚铁": "FeSO₄"
    }
};

let currentMode = 'formula';
let currentQuestion = '';
let currentAnswer = '';
let players = [];
let currentPlayerIndex = -1;
let answeredCount = {};

const allChemicals = Object.values(chemicals).reduce((acc, category) => {
    return acc.concat(Object.entries(category).map(([name, formula]) => ({ name, formula })));
}, []);

function startGame() {
    const count = parseInt(document.getElementById('playerCount').value);
    if (!count || count < 1 || count > 20) {
        alert("请输入1-20之间的有效人数");
        return;
    }

    players = Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        icon: icons[i % icons.length],
        score: 0,
        totalAnswers: 0, // 新增：答题次数
        correctAnswers: 0 // 新增：答对次数
    }));

    answeredCount = Object.fromEntries(players.map(p => [p.id, 0]));

    renderPlayers();
    document.getElementById('gameInterface').classList.remove('hidden');
    document.getElementById('setup').classList.add('hidden');
    newQuestion();
}

function renderPlayers() {
    const container = document.getElementById('players');

    // 按得分排序
    const sortedPlayers = players.slice().sort((a, b) => b.score - a.score);

    container.innerHTML = sortedPlayers.map((player, index) => {
        let rankClass = '';
        if (index === 0) rankClass = 'rank-1';
        else if (index === 1) rankClass = 'rank-2';
        else if (index === 2) rankClass = 'rank-3';

        // 如果当前玩家是被选中的玩家，添加 active 类
        const isActive = player.id === players[currentPlayerIndex]?.id;

        return `
            <div class="player-card ${rankClass} ${isActive ? 'active' : ''}" 
                 data-id="${player.id}">
                <div class="avatar">${player.icon}</div>
                <div class="player-info">
                    <div class="player-name">玩家 ${player.id}</div>
                    <div class="player-score">🎯 ${player.score} 分</div>
                    <div class="player-stats">
                        <span>答题: ${player.totalAnswers}</span>
                        <span>答对: ${player.correctAnswers}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getNextPlayer() {
    // 找到答题次数最少的用户
    const minTotalAnswers = Math.min(...players.map(p => p.totalAnswers));
    const candidates = players.filter(p => p.totalAnswers === minTotalAnswers);

    // 在答题次数最少的用户中随机选择一个
    const nextPlayer = candidates[Math.floor(Math.random() * candidates.length)];
    return nextPlayer;
}

function newQuestion(changePlayer = true) {
    document.getElementById('judge-buttons').classList.remove('visible');
    document.getElementById('judge-buttons').innerHTML = '';

    if (changePlayer) {
        const nextPlayer = getNextPlayer();
        currentPlayerIndex = players.findIndex(p => p.id === nextPlayer.id);
        players[currentPlayerIndex].totalAnswers++; // 更新答题次数
    }

    const actualMode = currentMode === 'mixed'
        ? Math.random() > 0.5 ? 'formula' : 'name'
        : currentMode;

    const { name, formula } = allChemicals[Math.floor(Math.random() * allChemicals.length)];
    currentQuestion = actualMode === 'formula' ? formula : name;
    currentAnswer = actualMode === 'formula' ? name : formula;

    document.getElementById('question').textContent = currentQuestion;
    document.getElementById('answer').textContent = '';
    renderPlayers();
}

function showAnswer() {
    document.getElementById('answer').textContent = currentAnswer;
    const judgeContainer = document.getElementById('judge-buttons');
    judgeContainer.innerHTML = `
        <button class="judge-btn correct" onclick="handleJudgement(true)">✓</button>
        <button class="judge-btn wrong" onclick="handleJudgement(false)">✕</button>
    `;
    judgeContainer.classList.add('visible');
}

function skipQuestion() {
    newQuestion(false);
}

function handleJudgement(isCorrect) {
    const currentPlayer = players[currentPlayerIndex];
    if (isCorrect) {
        currentPlayer.score += 1;
        currentPlayer.correctAnswers++; // 更新答对次数
    }
    renderPlayers();
    newQuestion();
}

function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    newQuestion();
}