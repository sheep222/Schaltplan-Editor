// www.kreativekiste.de // 05.04.2026 // Version 1.6
const canvas = document.getElementById('area-4');
const wiringLayer = document.getElementById('wiring-layer');

let draggedHTML = null; let draggedType = null; 

let startPort = null;
let connections = []; 

let isDraggingComponent = false;
let currentMovedElement = null;
let moveOffsetX = 0; let moveOffsetY = 0;
let hasMoved = false; 

// Variablen für Schütz -> Kontakt Zuordnung (Selbe Seite)
let isAssignMode = false;
let selectedParent = null;

// NEU: Variablen für Seitenübergreifende Verlinkungen (Pfeile)
window.crossPageAssign = { active: false, sourceId: null, sourcePage: null };

let coilCounter = 1; 
let contextMenuTarget = null;    // lokale Referenz (Kompatibilität)
window.contextMenuTarget = null; // FIX: window-Property damit ui.js es lesen kann

let pages = [ { id: 1, name: "Seite 1", components: [], connections: [] } ];
let currentPageId = 1;
let undoStack = [];
let redoStack = [];
let isRestoringSnapshot = false;
const UNDO_LIMIT = 120;

function cloneProjectState() {
    if (!isRestoringSnapshot && typeof saveCurrentPageState === 'function') {
        saveCurrentPageState();
    }
    return JSON.parse(JSON.stringify({
        pages: pages || [],
        currentPageId: currentPageId,
        coilCounter: typeof coilCounter !== 'undefined' ? coilCounter : 1,
        numberingMode: window.numberingMode || 'din',
        potentials: window.potentials || [],
        potentialSettings: window.potentialSettings || { nPosition: 'bottom', pePosition: 'bottom' },
        fCounter: window.fCounter || 1,
        qCounter: window.qCounter || 1
    }));
}

function snapshotsEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

function pushUndoSnapshot() {
    if (isRestoringSnapshot) return;
    const snap = cloneProjectState();
    const last = undoStack.length > 0 ? undoStack[undoStack.length - 1] : null;
    if (last && snapshotsEqual(last, snap)) return;
    undoStack.push(snap);
    if (undoStack.length > UNDO_LIMIT) undoStack.shift();
    redoStack = [];
}

function applyProjectState(snapshot) {
    if (!snapshot) return;
    isRestoringSnapshot = true;
    try {
        pages = JSON.parse(JSON.stringify(snapshot.pages || []));
        currentPageId = snapshot.currentPageId;
        if (typeof coilCounter !== 'undefined') coilCounter = snapshot.coilCounter || 1;
        window.numberingMode = snapshot.numberingMode || 'din';
        window.potentials = snapshot.potentials || [];
        window.potentialSettings = snapshot.potentialSettings || { nPosition: 'bottom', pePosition: 'bottom' };
        window.fCounter = snapshot.fCounter || 1;
        window.qCounter = snapshot.qCounter || 1;

        const area4 = document.getElementById('area-4');
        const deckblattView = document.getElementById('deckblatt-view');
        const ihvView = document.getElementById('ihv-view');
        if (area4) area4.classList.add('hidden');
        if (deckblattView) deckblattView.classList.add('hidden');
        if (ihvView) ihvView.classList.add('hidden');

        if (currentPageId === 'D') {
            if (deckblattView) deckblattView.classList.remove('hidden');
        } else if (currentPageId === 'I') {
            if (ihvView) ihvView.classList.remove('hidden');
            if (typeof renderIHVList === 'function') renderIHVList();
        } else {
            if (area4) area4.classList.remove('hidden');
            if (typeof loadPageState === 'function') loadPageState(currentPageId);
            if (typeof drawFrame === 'function') drawFrame();
        }
        if (typeof renderTabs === 'function') renderTabs();
    } finally {
        isRestoringSnapshot = false;
    }
}

window.undoLastAction = function() {
    if (undoStack.length < 2) {
        addHistory('Nichts zum Rückgängig machen', { skipSnapshot: true });
        return;
    }
    const current = undoStack.pop();
    redoStack.push(current);
    const previous = undoStack[undoStack.length - 1];
    applyProjectState(previous);
    addHistory('Rückgängig', { skipSnapshot: true });
};

window.redoLastAction = function() {
    if (redoStack.length === 0) {
        addHistory('Nichts zum Wiederholen', { skipSnapshot: true });
        return;
    }
    const next = redoStack.pop();
    undoStack.push(JSON.parse(JSON.stringify(next)));
    applyProjectState(next);
    addHistory('Wiederholen', { skipSnapshot: true });
};

function addHistory(text, options = {}) {
    if (!options.skipSnapshot) pushUndoSnapshot();
    const historyArea = document.getElementById('area-1');
    const item = document.createElement('div');
    item.className = 'history-item';
    item.textContent = '▶ ' + text;
    historyArea.appendChild(item);
    historyArea.scrollTop = historyArea.scrollHeight; 
}

document.addEventListener('keydown', (e) => {
    const key = (e.key || '').toLowerCase();
    const targetTag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    const isTypingTarget = targetTag === 'input' || targetTag === 'textarea' || (e.target && e.target.isContentEditable);
    if (isTypingTarget) return;

    if (e.ctrlKey && !e.shiftKey && key === 'z') {
        e.preventDefault();
        window.undoLastAction();
        return;
    }
    if ((e.ctrlKey && key === 'y') || (e.ctrlKey && e.shiftKey && key === 'z')) {
        e.preventDefault();
        window.redoLastAction();
    }
});

pushUndoSnapshot();