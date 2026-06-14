const DEFAULT_SUSPECTS = ['Srta. Scarlet', 'Prof. Black', 'Dr. Orchid', 'Sra. White', 'Cel. Mustard', 'Sr. Green'];
const DEFAULT_WEAPONS = ['Faca', 'Castiçal', 'Revólver', 'Corda', 'Chumbo', 'Chave Inglesa'];
const DEFAULT_ROOMS = ['Cozinha', 'Salão de Baile', 'Conservatório', 'Sala de Bilhar', 'Biblioteca', 'Estudo', 'Hall', 'Lounge', 'Sala de Jantar'];
const PLAYER_COLORS = ['#C9A84C', '#C0392B', '#4CAF80', '#6ABEEB', '#B09AE0', '#FF8C42'];

const MARK_STATES = ['empty', 'check', 'cross', 'question', 'star', 'wave', 'bang'];
const MARK_SYMBOLS = { empty: '·', check: '✓', cross: '✗', question: '?', star: '★', wave: '〜', bang: '!' };

let state = {
    caseNumber: '001',
    players: [
        { name: 'Você', color: PLAYER_COLORS[0], self: true },
        { name: 'Ana', color: PLAYER_COLORS[1] },
        { name: 'Pedro', color: PLAYER_COLORS[2] },
        { name: 'Carla', color: PLAYER_COLORS[3] }
    ],
    marks: {},
    notes: '',
    suggestions: [],
    solution: { suspect: '', weapon: '', room: '' },
    suspects: DEFAULT_SUSPECTS.slice(),
    weapons: DEFAULT_WEAPONS.slice(),
    rooms: DEFAULT_ROOMS.slice()
};

function markKey(category, item, playerIdx) {
    return `${category}__${item}__${playerIdx}`;
}

function getMark(category, item, playerIdx) {
    return state.marks[markKey(category, item, playerIdx)] || 'empty';
}

function cycleMark(category, item, playerIdx) {
    const key = markKey(category, item, playerIdx);
    const cur = state.marks[key] || 'empty';
    const idx = MARK_STATES.indexOf(cur);
    const next = MARK_STATES[(idx + 1) % MARK_STATES.length];
    state.marks[key] = next;
    saveState();
    return next;
}

function buildGrid(containerId, category, items) {
    const container = document.getElementById(containerId);
    const n = state.players.length;
    container.style.setProperty('--player-count', n);

    let html = '';

    // Header row
    html += `<div class="clue-row header-row">`;
    html += `<div class="clue-cell" style="font-size:10px;color:var(--cream-faint);">carta</div>`;
    state.players.forEach((p, i) => {
        html += `<div class="clue-cell mark-cell" style="font-size:10px;color:${p.color};font-family:'IBM Plex Mono',monospace;letter-spacing:0.04em;">${abbrev(p.name)}</div>`;
    });
    html += `</div>`;

    items.forEach(item => {
        html += `<div class="clue-row" data-item="${escape(item)}">`;
        html += `<div class="clue-cell name-cell">${item}</div>`;
        state.players.forEach((p, i) => {
            const st = getMark(category, item, i);
            const sym = MARK_SYMBOLS[st];
            html += `<div class="clue-cell mark-cell" tabindex="0" role="button" aria-label="${item} - ${p.name}" data-category="${category}" data-item="${encodeURIComponent(item)}" data-player="${i}">
        <div class="mark" data-state="${st}">${sym}</div>
      </div>`;
        });
        html += `</div>`;
    });

    container.innerHTML = html;

    container.querySelectorAll('.mark-cell[data-player]').forEach(cell => {
        const handler = (e) => {
            e.preventDefault();
            const cat = cell.dataset.category;
            const item = decodeURIComponent(cell.dataset.item);
            const pi = parseInt(cell.dataset.player);
            const newState = cycleMark(cat, item, pi);
            const markEl = cell.querySelector('.mark');
            markEl.setAttribute('data-state', newState);
            markEl.textContent = MARK_SYMBOLS[newState];
        };
        cell.addEventListener('click', handler);
        cell.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handler(e); });
    });
}

function buildLegend(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = state.players.map((p, i) => `
    <div class="legend-item">
      <span class="legend-icon" style="color:${p.color};">●</span>
      <span class="legend-label">${p.name}${p.self ? ' (você)' : ''}</span>
    </div>
  `).join('');
}

function abbrev(name) {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return name.substring(0, 3);
    return parts[0].substring(0, 1) + '.' + parts[parts.length - 1].substring(0, 1) + '.';
}

function buildAll() {
    buildLegend('legend-suspects');
    buildLegend('legend-weapons');
    buildLegend('legend-rooms');
    buildGrid('grid-suspects', 'suspects', state.suspects);
    buildGrid('grid-weapons', 'weapons', state.weapons);
    buildGrid('grid-rooms', 'rooms', state.rooms);
    buildSolutionSelects();
    buildPlayersList();
    buildCardConfig();
    buildSuggestionsList();
    document.getElementById('notesText').value = state.notes;
    document.getElementById('caseNumber').value = state.caseNumber;
    document.getElementById('caseBadge').textContent = `Sessão #${state.caseNumber}`;
}

function buildSolutionSelects() {
    const solS = document.getElementById('sol-suspect');
    const solW = document.getElementById('sol-weapon');
    const solR = document.getElementById('sol-room');

    solS.innerHTML = '<option value="">— ?</option>' + state.suspects.map(s => `<option value="${s}" ${state.solution.suspect === s ? 'selected' : ''}>${s}</option>`).join('');
    solW.innerHTML = '<option value="">— ?</option>' + state.weapons.map(w => `<option value="${w}" ${state.solution.weapon === w ? 'selected' : ''}>${w}</option>`).join('');
    solR.innerHTML = '<option value="">— ?</option>' + state.rooms.map(r => `<option value="${r}" ${state.solution.room === r ? 'selected' : ''}>${r}</option>`).join('');

    solS.onchange = () => { state.solution.suspect = solS.value; saveState(); };
    solW.onchange = () => { state.solution.weapon = solW.value; saveState(); };
    solR.onchange = () => { state.solution.room = solR.value; saveState(); };

    // Suggestion modal selects
    const sugWho = document.getElementById('sug-who');
    const sugRef = document.getElementById('sug-refuted');
    const sugS = document.getElementById('sug-suspect');
    const sugW = document.getElementById('sug-weapon');
    const sugR = document.getElementById('sug-room');

    sugWho.innerHTML = state.players.map((p, i) => `<option value="${p.name}">${p.name}</option>`).join('');
    sugRef.innerHTML = '<option value="ninguém">Ninguém refutou</option>' + state.players.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
    sugS.innerHTML = '<option value="">—</option>' + state.suspects.map(s => `<option value="${s}">${s}</option>`).join('');
    sugW.innerHTML = '<option value="">—</option>' + state.weapons.map(w => `<option value="${w}">${w}</option>`).join('');
    sugR.innerHTML = '<option value="">—</option>' + state.rooms.map(r => `<option value="${r}">${r}</option>`).join('');
}

function buildPlayersList() {
    const el = document.getElementById('players-list');
    el.innerHTML = state.players.map((p, i) => `
    <div class="player-list-item">
      <div class="dot" style="background:${p.color}"></div>
      <span class="pname">${p.name}</span>
      <div style="display:flex;gap:4px;"><button class="btn-small" onclick="openEditPlayerModal(${i})" style="padding:4px 8px;font-size:10px;flex:1;">✎ Editar</button>${!p.self ? `<button class="btn-danger" onclick="removePlayer(${i})" style="padding:4px 8px;font-size:10px;">✕</button>` : ''}</div>
    </div>
  `).join('');
}

function buildCardConfig() {
    const categories = [
        { key: 'suspects', label: 'Suspeitos', placeholder: 'Novo suspeito...' },
        { key: 'weapons', label: 'Armas', placeholder: 'Nova arma...' },
        { key: 'rooms', label: 'Cômodos', placeholder: 'Novo cômodo...' }
    ];
    const container = document.getElementById('card-config');
    container.innerHTML = categories.map(cat => {
        const itemsHtml = state[cat.key].map((item, i) => `
      <div class="category-row">
        <span class="item-label">${item}</span>
        <button class="btn-danger" onclick="removeCardItem('${cat.key}', ${i})" style="padding:4px 8px;font-size:10px;">✕</button>
      </div>
    `).join('');
        return `
      <div class="category-card">
        <div class="category-list-title">${cat.label}</div>
        <div class="category-list">${itemsHtml}</div>
        <div class="setup-input-row">
          <input type="text" class="setup-input" id="new-${cat.key}" placeholder="${cat.placeholder}" maxlength="22">
          <button class="btn-primary" onclick="addCardItem('${cat.key}')">Adicionar</button>
        </div>
      </div>
    `;
    }).join('');
}

function addCardItem(category) {
    const input = document.getElementById(`new-${category}`);
    const value = input.value.trim();
    if (!value) return;
    if (!state[category]) return;
    if (state[category].includes(value)) {
        alert('Esta carta já está na lista.');
        return;
    }
    state[category].push(value);
    input.value = '';
    saveState();
    buildAll();
}

function removeCardItem(category, index) {
    if (!state[category] || index < 0 || index >= state[category].length) return;
    if (state[category].length <= 1) {
        alert('Deve haver pelo menos um item nesta categoria.');
        return;
    }
    const removedItem = state[category].splice(index, 1)[0];
    Object.keys(state.marks).forEach(key => {
        if (key.startsWith(`${category}__${removedItem}__`)) {
            delete state.marks[key];
        }
    });
    saveState();
    buildAll();
}

function buildSuggestionsList() {
    const el = document.getElementById('suggestions-list');
    if (!state.suggestions.length) {
        el.innerHTML = '<div style="color: var(--cream-faint); font-size: 12px; padding: 1rem 0;">Nenhuma sugestão registrada ainda.</div>';
        return;
    }
    el.innerHTML = state.suggestions.slice().reverse().map((s, i) => `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:4px;padding:0.75rem;margin-bottom:8px;font-size:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="color:var(--gold);font-size:11px;letter-spacing:0.06em;">${s.who} sugeriu</span>
        <span style="color:var(--cream-faint);font-size:10px;">${s.time}</span>
      </div>
      <div style="color:var(--cream);line-height:1.7;">${s.suspect} + ${s.weapon} + ${s.room}</div>
      <div style="color:${s.refuted === 'ninguém' ? 'var(--red-bright)' : 'var(--cream-faint)'};font-size:11px;margin-top:4px;">
        ${s.refuted === 'ninguém' ? '⚠ Ninguém refutou!' : `Refutado por ${s.refuted}`}
      </div>
    </div>
  `).join('');
}

// Players management
function addPlayer() {
    const input = document.getElementById('newPlayerName');
    const name = input.value.trim();
    if (!name) return;
    if (state.players.length >= 6) { alert('Máximo de 6 jogadores!'); return; }
    const colorIdx = state.players.length % PLAYER_COLORS.length;
    state.players.push({ name, color: PLAYER_COLORS[colorIdx] });
    input.value = '';
    saveState();
    buildAll();
}

function removePlayer(idx) {
    if (state.players[idx].self) return;
    if (state.players.length <= 2) { alert('Mínimo de 2 jogadores!'); return; }
    state.players.splice(idx, 1);
    saveState();
    buildAll();
}

function openEditPlayerModal(idx) {
    const player = state.players[idx];
    document.getElementById('edit-player-idx').value = idx;
    document.getElementById('edit-player-name').value = player.name;
    document.getElementById('edit-player-color').value = player.color;
    document.getElementById('editPlayerModal').classList.add('open');
}

function closeEditPlayerModal() {
    document.getElementById('editPlayerModal').classList.remove('open');
}

function saveEditPlayer() {
    const idx = parseInt(document.getElementById('edit-player-idx').value);
    const newName = document.getElementById('edit-player-name').value.trim();
    const newColor = document.getElementById('edit-player-color').value;
    if (!newName) { alert('Nome não pode estar vazio.'); return; }
    if (idx >= 0 && idx < state.players.length) {
        state.players[idx].name = newName;
        state.players[idx].color = newColor;
        saveState();
        buildAll();
        closeEditPlayerModal();
    }
}

function updateCaseNumber() {
    const val = document.getElementById('caseNumber').value.trim();
    if (val) { state.caseNumber = val; saveState(); buildAll(); }
}

// Notes
function saveNotes() {
    state.notes = document.getElementById('notesText').value;
    saveState();
    const el = document.getElementById('notes-saved');
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, 1500);
}

// Auto-save notes on input
document.getElementById('notesText').addEventListener('input', function () {
    state.notes = this.value;
    saveState();
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
});

// Modals
function openLegendModal() { document.getElementById('legendModal').classList.add('open'); }
function closeLegendModal() { document.getElementById('legendModal').classList.remove('open'); }
function openSuggestionModal() {
    buildSolutionSelects();
    document.getElementById('suggestionModal').classList.add('open');
}
function closeSuggestionModal() { document.getElementById('suggestionModal').classList.remove('open'); }

document.getElementById('legendModal').addEventListener('click', function (e) {
    if (e.target === this) closeLegendModal();
});
document.getElementById('suggestionModal').addEventListener('click', function (e) {
    if (e.target === this) closeSuggestionModal();
});
document.getElementById('editPlayerModal').addEventListener('click', function (e) {
    if (e.target === this) closeEditPlayerModal();
});

function saveSuggestion() {
    const sug = {
        who: document.getElementById('sug-who').value,
        suspect: document.getElementById('sug-suspect').value || '?',
        weapon: document.getElementById('sug-weapon').value || '?',
        room: document.getElementById('sug-room').value || '?',
        refuted: document.getElementById('sug-refuted').value,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    state.suggestions.push(sug);
    saveState();
    buildSuggestionsList();
    closeSuggestionModal();
}

// Export
function exportData() {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `detetive-sessao-${state.caseNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const imported = JSON.parse(reader.result);
            if (!imported || typeof imported !== 'object') throw new Error('Formato inválido');
            if (!Array.isArray(imported.suspects) || !Array.isArray(imported.weapons) || !Array.isArray(imported.rooms)) {
                throw new Error('O arquivo deve conter arrays de suspects, weapons e rooms.');
            }
            const nextState = {
                ...state,
                ...imported,
                suspects: imported.suspects.slice(),
                weapons: imported.weapons.slice(),
                rooms: imported.rooms.slice(),
                players: Array.isArray(imported.players) && imported.players.length > 0 ? imported.players.map((p, i) => ({
                    name: p.name || `Jogador ${i + 1}`,
                    color: p.color || PLAYER_COLORS[i % PLAYER_COLORS.length],
                    self: !!p.self
                })) : state.players,
                marks: imported.marks || {},
                notes: typeof imported.notes === 'string' ? imported.notes : state.notes,
                suggestions: Array.isArray(imported.suggestions) ? imported.suggestions : state.suggestions,
                solution: imported.solution || state.solution,
                caseNumber: imported.caseNumber || state.caseNumber
            };
            state = nextState;
            saveState();
            buildAll();
            alert('Importação concluída com sucesso.');
        } catch (err) {
            alert('Falha ao importar JSON: ' + err.message);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function confirmReset() {
    if (confirm('Resetar a partida? Todas as marcações serão apagadas.')) {
        state.marks = {};
        state.suggestions = [];
        state.solution = { suspect: '', weapon: '', room: '' };
        state.notes = '';
        saveState();
        buildAll();
    }
}

// Persistence
function saveState() {
    try { localStorage.setItem('detetive_v1', JSON.stringify(state)); } catch (e) { }
}

function loadState() {
    try {
        const saved = localStorage.getItem('detetive_v1');
        if (saved) {
            const parsed = JSON.parse(saved);
            state = { ...state, ...parsed };
            if (Array.isArray(parsed.suspects) && parsed.suspects.length > 0) state.suspects = parsed.suspects;
            if (Array.isArray(parsed.weapons) && parsed.weapons.length > 0) state.weapons = parsed.weapons;
            if (Array.isArray(parsed.rooms) && parsed.rooms.length > 0) state.rooms = parsed.rooms;
        }
    } catch (e) { }
}

// Init
loadState();
buildAll();