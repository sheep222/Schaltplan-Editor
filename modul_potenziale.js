// www.kreativekiste.de // 14.04.2026 // Modul: Potenziale v3.7

// ============================================================
// 1. ORDNER IN DER SIDEBAR REGISTRIEREN
// ============================================================
window.ComponentRegistry.folders.push({
    id: 'potenziale', name: 'Potenziale', open: false
});

// ============================================================
// 2. VORSCHAU-BAUTEILE FÜR DIE SIDEBAR
// ============================================================
window.ComponentRegistry.register('pot_1phase', {
    folder: 'potenziale', title: 'Einphasig (L1)', defaultData: { potPhases: '1' },
    svg: `<svg viewBox="0 0 110 22" width="110" height="22" class="symbol">
        <text x="2" y="15" font-size="10" font-family="Arial" font-weight="bold" fill="#8B4513">L1</text>
        <line x1="20" y1="11" x2="95" y2="11" stroke="#8B4513" stroke-width="2"/>
        <text x="97" y="15" font-size="10" font-family="Arial" fill="#8B4513">2</text>
    </svg>`
});
window.ComponentRegistry.register('pot_2phase', {
    folder: 'potenziale', title: 'Zweiphasig (L1+L2)', defaultData: { potPhases: '2' },
    svg: `<svg viewBox="0 0 110 38" width="110" height="38" class="symbol">
        <text x="2" y="13" font-size="10" font-family="Arial" font-weight="bold" fill="#8B4513">L1</text>
        <line x1="20" y1="10" x2="95" y2="10" stroke="#8B4513" stroke-width="2"/>
        <text x="2" y="31" font-size="10" font-family="Arial" font-weight="bold" fill="#1a1a1a">L2</text>
        <line x1="20" y1="28" x2="95" y2="28" stroke="#1a1a1a" stroke-width="2"/>
    </svg>`
});
window.ComponentRegistry.register('pot_3phase', {
    folder: 'potenziale', title: 'Dreiphasig (L1+L2+L3)', defaultData: { potPhases: '3' },
    svg: `<svg viewBox="0 0 110 54" width="110" height="54" class="symbol">
        <text x="2" y="13" font-size="10" font-family="Arial" font-weight="bold" fill="#8B4513">L1</text>
        <line x1="20" y1="10" x2="95" y2="10" stroke="#8B4513" stroke-width="2"/>
        <text x="2" y="31" font-size="10" font-family="Arial" font-weight="bold" fill="#1a1a1a">L2</text>
        <line x1="20" y1="28" x2="95" y2="28" stroke="#1a1a1a" stroke-width="2"/>
        <text x="2" y="49" font-size="10" font-family="Arial" font-weight="bold" fill="#888888">L3</text>
        <line x1="20" y1="46" x2="95" y2="46" stroke="#888888" stroke-width="2"/>
    </svg>`
});

// ============================================================
// 3. GLOBALER ZUSTAND
// ============================================================
if (!window.potentials)        window.potentials = [];
if (!window.potentialSettings) window.potentialSettings = {
    nPosition:  'bottom',
    pePosition: 'bottom'
};

// ============================================================
// 4. KONSTANTEN — aus rahmen.js viewBox="0 0 1123 794"
// ============================================================
const _LX1 = 35;
const _LX2 = 1113;

const _LABEL_X      = _LX1 + 2;   // = 37
const _LABEL_ANCHOR = 'start';
const _LINE_X1 = 55;
const _LINE_X2 = 1113;
const _PN_LEFT  = _LINE_X1 + 4;
const _PN_RIGHT = _LINE_X2 - 4;

const _LH  = 20;
const _GAP =  8;
const _PY_TOP = 50;
const _PY_N  = 684;
const _PY_PE = 704;
const _Y_MIN = 50;
const _Y_MAX = 718;

const _COLORS_DEFAULT = {
    1: ['#8B4513'],
    2: ['#8B4513', '#1a1a1a'],
    3: ['#8B4513', '#1a1a1a', '#888888']
};
const _N_COLOR  = '#0000cc';
const _PE_COLOR = '#00aa44';

const _POS_NEXT  = { bottom: 'top', top: 'free', free: 'bottom' };
const _POS_LABEL = {
    bottom: '⬇️ Unten (Seitenende)',
    top:    '⬆️ Oben (bei Phasen)',
    free:   '✋ Frei (verschiebbar)'
};

// ============================================================
// 5. INTERNER ZUSTAND
// ============================================================
let _potDrag = null;

// Steuert ob der "Einblend-Modus" aktiv ist
// (zeigt ausgeblendete Potenziale als gestrichelte Linien)
let _revealMode = false;

// ============================================================
// 6. HILFSFUNKTIONEN
// ============================================================
function _phases(pot) {
    return pot.phases === '1' ? ['L1']
         : pot.phases === '2' ? ['L1', 'L2']
         : ['L1', 'L2', 'L3'];
}

function _pageNav(pot, cp) {
    const all = (typeof pages !== 'undefined') ? pages : [];
    const vis = all
        .filter(p => !pot.hiddenOnPages || !pot.hiddenOnPages.includes(p.id))
        .map(p => p.id);
    const i = vis.indexOf(cp);
    return {
        prev: i > 0 ? vis[i - 1] : null,
        next: (i >= 0 && i < vis.length - 1) ? vis[i + 1] : null
    };
}

function _resolveY(pos, freeY, defaultY, topFallback) {
    if (pos === 'bottom') return defaultY;
    if (pos === 'top')    return topFallback;
    if (pos === 'free')   return freeY !== undefined ? freeY : defaultY;
    return defaultY;
}

const _NS = 'http://www.w3.org/2000/svg';

function _el(tag, attrs) {
    const e = document.createElementNS(_NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    return e;
}

function _txt(x, y, content, col, size, anchor, weight) {
    const t = _el('text', {
        x, y,
        'font-family': 'Arial',
        'font-size':   size   || '10',
        'fill':        col    || '#1a1a1a',
        'text-anchor': anchor || 'start'
    });
    if (weight) t.setAttribute('font-weight', weight);
    t.textContent = content;
    t.style.pointerEvents = 'none';
    return t;
}

function _ln(x1, y1, x2, y2, col, w, dash) {
    const l = _el('line', { x1, y1, x2, y2, stroke: col || 'black', 'stroke-width': w || '2' });
    if (dash) l.setAttribute('stroke-dasharray', dash);
    return l;
}

function _getPotGroup() {
    const frame = document.getElementById('drawing-frame');
    if (!frame) return null;
    return frame.querySelector('#pot-layer');
}

// ============================================================
// 7. EINE HORIZONTALE LINIE ZEICHNEN
// ============================================================
function _drawPotLine(root, label, color, yMid, prev, next, draggable, pot, field, isGhost) {
    const g = _el('g', { class: isGhost ? 'pot-line-group pot-ghost' : 'pot-line-group' });

    // Label
    const lblOpacity = isGhost ? '0.45' : '1';
    const lblEl = _txt(_LABEL_X, yMid + 4, label, color, '10', _LABEL_ANCHOR, 'bold');
    lblEl.setAttribute('opacity', lblOpacity);
    g.appendChild(lblEl);

    // Linie (gestrichelt wenn ghost)
    const dash = isGhost ? '6,4' : null;
    const lineOpacity = isGhost ? '0.45' : '1';
    const lineEl = _ln(_LINE_X1, yMid, _LINE_X2, yMid, color, '2', dash);
    lineEl.setAttribute('opacity', lineOpacity);
    g.appendChild(lineEl);

    // Seitenzahlen (nur bei normalen Linien)
    if (!isGhost) {
        if (prev !== null) {
            g.appendChild(_txt(_PN_LEFT, yMid - 3, '←' + String(prev), color, '8', 'start'));
        }
        if (next !== null) {
            g.appendChild(_txt(_PN_RIGHT, yMid - 3, String(next) + '→', color, '8', 'end'));
        }
    }

    // Drag-Hinweis
    if (draggable && !isGhost) {
        g.appendChild(_txt((_LINE_X1 + _LINE_X2) / 2, yMid - 10, '▲▼ verschiebbar', '#bbb', '8', 'middle'));
    }

    // Trefferrechteck
    const hit = _el('rect', {
        x:      _LX1,
        y:      yMid - _LH / 2,
        width:  _LX2 - _LX1,
        height: _LH,
        fill:   'transparent'
    });
    hit.style.pointerEvents = 'all';

    if (isGhost) {
        // Ghost-Linie: Klick macht das Potenzial auf dieser Seite wieder sichtbar
        hit.style.cursor = 'pointer';
        hit.addEventListener('click', e => {
            e.stopPropagation();
            const cp = (typeof currentPageId !== 'undefined') ? currentPageId : 1;
            // Aus hiddenOnPages entfernen
            if (pot.hiddenOnPages) {
                pot.hiddenOnPages = pot.hiddenOnPages.filter(p => p !== cp);
            }
            // Einblend-Modus beenden und neu rendern
            _revealMode = false;
            window.renderPotentials();
            if (typeof addHistory === 'function') addHistory('Potenzial eingeblendet');
        });
    } else {
        hit.style.cursor = draggable ? 'ns-resize' : 'pointer';
        hit.addEventListener('dblclick', e => {
            e.stopPropagation();
            _showContextMenu(e.clientX, e.clientY, pot);
        });
        if (draggable) {
            hit.addEventListener('mousedown', e => {
                e.preventDefault();
                e.stopPropagation();
                _potDrag = { pot, field };
            });
        }
    }
    g.appendChild(hit);
    root.appendChild(g);
}

// ============================================================
// 8. HAUPT-RENDER-FUNKTION
// ============================================================
window.renderPotentials = function () {
    const root = _getPotGroup();
    if (!root) return;

    while (root.firstChild) root.removeChild(root.firstChild);

    const cp = (typeof currentPageId !== 'undefined') ? currentPageId : 1;
    if (cp === 'D' || cp === 'I') return;

    let phaseY = _PY_TOP;

    // ── SICHTBARE POTENZIALE ──────────────────────────────────────────────
    window.potentials.forEach((pot, idx) => {
        if (pot.hiddenOnPages && pot.hiddenOnPages.includes(cp)) return;

        const showN  = !(pot.hideNOnPages  && pot.hideNOnPages.includes(cp));
        const showPE = !(pot.hidePEOnPages && pot.hidePEOnPages.includes(cp));
        const { prev, next } = _pageNav(pot, cp);
        const nPos  = window.potentialSettings.nPosition;
        const pePos = window.potentialSettings.pePosition;

        const phLabels = _phases(pot);
        const colors   = pot.phaseColors || _COLORS_DEFAULT[parseInt(pot.phases)] || ['#1a1a1a'];

        if (pot.name) {
            root.appendChild(_txt((_LINE_X1 + _LINE_X2) / 2, phaseY - _LH / 2 - 2, pot.name, '#555', '10', 'middle'));
        }

        phLabels.forEach((label, i) => {
            const yMid = phaseY + i * _LH;
            const col  = colors[i] || '#1a1a1a';
            _drawPotLine(root, label, col, yMid, prev, next, false, pot, null, false);
        });

        const phH   = phLabels.length * _LH;
        const phHit = _el('rect', {
            x:      _LX1,
            y:      phaseY - _LH / 2,
            width:  _LX2 - _LX1,
            height: phH,
            fill:   'transparent'
        });
        phHit.style.pointerEvents = 'all';
        phHit.style.cursor = 'pointer';
        phHit.addEventListener('dblclick', e => {
            e.stopPropagation();
            _showContextMenu(e.clientX, e.clientY, pot);
        });
        root.appendChild(phHit);

        const phaseGroupBottom = phaseY + (phLabels.length - 1) * _LH;
        phaseY = phaseGroupBottom + _LH + _GAP;

        if (showN) {
            const nY = _resolveY(nPos, pot.nFreeY, _PY_N - idx * _LH, phaseGroupBottom + _LH + _GAP);
            _drawPotLine(root, 'N', _N_COLOR, nY, prev, next, nPos === 'free', pot, 'nFreeY', false);
        }

        if (showPE) {
            const peTopBase = phaseGroupBottom + _LH + _GAP;
            const peTop     = peTopBase + (showN && nPos === pePos ? _LH : 0);
            const peY       = _resolveY(pePos, pot.peFreeY, _PY_PE - idx * _LH, peTop);
            _drawPotLine(root, 'PE', _PE_COLOR, peY, prev, next, pePos === 'free', pot, 'peFreeY', false);
        }
    });

    // ── AUSGEBLENDETE POTENZIALE (Einblend-Modus) ────────────────────────
    if (_revealMode) {
        let ghostY = _PY_TOP + (window.potentials.filter(p => !(p.hiddenOnPages && p.hiddenOnPages.includes(cp))).length) * (_LH + _GAP) + 30;

        window.potentials.forEach((pot, idx) => {
            if (!(pot.hiddenOnPages && pot.hiddenOnPages.includes(cp))) return;

            const phLabels = _phases(pot);
            const colors   = pot.phaseColors || _COLORS_DEFAULT[parseInt(pot.phases)] || ['#1a1a1a'];

            // "Ausgeblendet"-Hinweis über den Ghost-Linien
            root.appendChild(_txt(
                (_LINE_X1 + _LINE_X2) / 2,
                ghostY - _LH / 2 - 2,
                (pot.name || 'Potenzial') + ' – ausgeblendet (Klick zum Einblenden)',
                '#aaa', '9', 'middle'
            ));

            phLabels.forEach((label, i) => {
                const yMid = ghostY + i * _LH;
                const col  = colors[i] || '#1a1a1a';
                _drawPotLine(root, label, col, yMid, null, null, false, pot, null, true);
            });

            const nPos  = window.potentialSettings.nPosition;
            const pePos = window.potentialSettings.pePosition;
            const phaseGroupBottom = ghostY + (phLabels.length - 1) * _LH;
            ghostY = phaseGroupBottom + _LH + _GAP;

            const showN  = !(pot.hideNOnPages  && pot.hideNOnPages.includes(cp));
            const showPE = !(pot.hidePEOnPages && pot.hidePEOnPages.includes(cp));

            if (showN) {
                const nY = _resolveY(nPos, pot.nFreeY, _PY_N - idx * _LH, phaseGroupBottom + _LH + _GAP);
                _drawPotLine(root, 'N', _N_COLOR, nY, null, null, false, pot, null, true);
            }
            if (showPE) {
                const peTopBase = phaseGroupBottom + _LH + _GAP;
                const peTop     = peTopBase + (showN && nPos === pePos ? _LH : 0);
                const peY       = _resolveY(pePos, pot.peFreeY, _PY_PE - idx * _LH, peTop);
                _drawPotLine(root, 'PE', _PE_COLOR, peY, null, null, false, pot, null, true);
            }
        });

        // ── Hinweis-Banner im Zeichenfeld ──
        const banner = _el('g', { class: 'pot-reveal-banner' });
        const bannerBg = _el('rect', {
            x: _LINE_X1, y: _PY_TOP - 18,
            width: _LINE_X2 - _LINE_X1, height: 16,
            fill: '#fff3cd', rx: '3', opacity: '0.92'
        });
        const bannerTxt = _txt(
            (_LINE_X1 + _LINE_X2) / 2, _PY_TOP - 6,
            '👁 Einblend-Modus aktiv – Klick auf gestrichelte Linie = einblenden   |   Klick ins freie Feld = beenden',
            '#7d6000', '9', 'middle'
        );
        bannerTxt.style.pointerEvents = 'none';
        banner.appendChild(bannerBg);
        banner.appendChild(bannerTxt);

        // Klick ins freie Feld beendet Einblend-Modus
        const bgHit = _el('rect', {
            x: 0, y: 0, width: 1123, height: 794,
            fill: 'transparent'
        });
        bgHit.style.pointerEvents = 'all';
        bgHit.style.cursor = 'default';
        bgHit.addEventListener('click', e => {
            _revealMode = false;
            window.renderPotentials();
        });
        // Hinter alles andere einfügen
        root.insertBefore(bgHit, root.firstChild);

        root.appendChild(banner);
    }
};

// ============================================================
// 9. DRAG-HANDLER
// ============================================================
document.addEventListener('mousemove', e => {
    if (!_potDrag) return;
    const frame = document.getElementById('drawing-frame');
    if (!frame) return;
    const pt = frame.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = frame.getScreenCTM();
    if (!ctm) return;
    const svgPt = pt.matrixTransform(ctm.inverse());
    _potDrag.pot[_potDrag.field] = Math.max(_Y_MIN, Math.min(_Y_MAX, Math.round(svgPt.y)));
    window.renderPotentials();
});

document.addEventListener('mouseup', () => {
    if (_potDrag) {
        _potDrag = null;
        if (typeof addHistory === 'function') addHistory('N/PE-Linie verschoben');
    }
});

// ============================================================
// 10. DOPPELKLICK AUF SIDEBAR-BAUTEIL → EINBLEND-MODUS
// ============================================================
document.addEventListener('dblclick', e => {
    const compItem = e.target.closest('.component-item[data-type^="pot_"]');
    if (!compItem) return;

    const cp = (typeof currentPageId !== 'undefined') ? currentPageId : 1;
    if (cp === 'D' || cp === 'I') return;

    // Gibt es überhaupt ausgeblendete Potenziale auf dieser Seite?
    const hasHidden = window.potentials.some(p => p.hiddenOnPages && p.hiddenOnPages.includes(cp));
    if (!hasHidden) {
        // Kurze Info-Meldung
        const info = document.createElement('div');
        info.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#2c3e50;color:white;padding:10px 20px;border-radius:6px;z-index:999999;font-family:Arial,sans-serif;font-size:13px;';
        info.textContent = 'Keine ausgeblendeten Potenziale auf dieser Seite.';
        document.body.appendChild(info);
        setTimeout(() => info.remove(), 2500);
        return;
    }

    e.stopPropagation();
    _revealMode = true;
    window.renderPotentials();
}, true);

// ============================================================
// 11. KONTEXT-MENÜ
// ============================================================
function _showContextMenu(x, y, pot) {
    if (typeof hideContextMenu === 'function') hideContextMenu();

    let menu = document.getElementById('pot-ctx');
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'pot-ctx';
        menu.style.cssText = 'position:fixed;background:white;border:1px solid #bdc3c7;box-shadow:2px 2px 10px rgba(0,0,0,0.2);border-radius:4px;padding:5px 0;z-index:200000;min-width:280px;font-family:Arial,sans-serif;display:none;';
        document.body.appendChild(menu);
    }

    const cp   = (typeof currentPageId !== 'undefined') ? currentPageId : 1;
    const iH   = pot.hiddenOnPages  && pot.hiddenOnPages.includes(cp);
    const iHN  = pot.hideNOnPages   && pot.hideNOnPages.includes(cp);
    const iHPE = pot.hidePEOnPages  && pot.hidePEOnPages.includes(cp);
    const nP   = window.potentialSettings.nPosition;
    const peP  = window.potentialSettings.pePosition;

    const mi = (ic, ht, id, ex = '') => `<div class="pmi" id="${id}" style="padding:8px 15px;cursor:pointer;font-size:13px;${ex}">${ic} ${ht}</div>`;
    const hr = () => `<hr style="margin:4px 0;border:none;border-top:1px solid #eee;">`;
    const hd = t  => `<div style="padding:3px 15px;font-size:11px;color:#7f8c8d;font-weight:bold;">${t}</div>`;

    menu.innerHTML = `
        <div style="padding:6px 15px;font-size:11px;color:#7f8c8d;font-weight:bold;border-bottom:1px solid #eee;">
            POTENZIAL${pot.name ? ': <span style="color:#2c3e50">' + pot.name + '</span>' : ''}
        </div>
        ${mi('👁️', iH ? 'Auf dieser Seite <b>einblenden</b>' : 'Auf dieser Seite <b>ausblenden</b>', 'pm-tog')}
        ${mi('📝', 'Name vergeben / ändern', 'pm-ren')}
        ${mi('🎨', 'Phasenfarben ändern', 'pm-col')}
        ${hr()}
        ${hd('NEUTRALLEITER (N)')}
        ${mi('🔵', `Sichtbarkeit (diese Seite): <b>${iHN  ? '❌ AUS' : '✅ AN'}</b>`, 'pm-nv')}
        ${mi('↕️',  `Position (Dokument): <b>${_POS_LABEL[nP]}</b>`, 'pm-np')}
        ${hr()}
        ${hd('SCHUTZLEITER (PE)')}
        ${mi('🟢', `Sichtbarkeit (diese Seite): <b>${iHPE ? '❌ AUS' : '✅ AN'}</b>`, 'pm-pev')}
        ${mi('↕️',  `Position (Dokument): <b>${_POS_LABEL[peP]}</b>`, 'pm-pep')}
        ${hr()}
        ${mi('🗑️', 'Potenzial löschen (alle Seiten)', 'pm-del', 'color:#e74c3c')}
    `;

    menu.querySelectorAll('.pmi').forEach(el => {
        el.addEventListener('mouseover', () => el.style.background = '#ecf0f1');
        el.addEventListener('mouseout',  () => el.style.background = '');
    });

    menu.style.left    = x + 'px';
    menu.style.top     = y + 'px';
    menu.style.display = 'block';

    const cls = () => { menu.style.display = 'none'; };
    const _on = (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn; };

    _on('pm-tog', e => {
        e.stopPropagation();
        if (!pot.hiddenOnPages) pot.hiddenOnPages = [];
        if (iH) pot.hiddenOnPages = pot.hiddenOnPages.filter(p => p !== cp);
        else    pot.hiddenOnPages.push(cp);
        cls(); window.renderPotentials();
        if (typeof addHistory === 'function') addHistory('Potenzial-Sichtbarkeit geändert');
    });
    _on('pm-ren', e => {
        e.stopPropagation(); cls();
        const n = prompt('Potenzial-Name:', pot.name || '');
        if (n !== null) { pot.name = n; window.renderPotentials(); }
        if (typeof addHistory === 'function') addHistory('Potenzial umbenannt');
    });
    _on('pm-col', e => { e.stopPropagation(); cls(); _showColorDialog(pot); });
    _on('pm-nv', e => {
        e.stopPropagation();
        if (!pot.hideNOnPages) pot.hideNOnPages = [];
        if (iHN) pot.hideNOnPages = pot.hideNOnPages.filter(p => p !== cp);
        else     pot.hideNOnPages.push(cp);
        cls(); window.renderPotentials();
        if (typeof addHistory === 'function') addHistory('N-Sichtbarkeit geändert');
    });
    _on('pm-np', e => {
        e.stopPropagation();
        const nx = _POS_NEXT[nP] || 'bottom';
        window.potentialSettings.nPosition = nx;
        if (nx === 'free') window.potentials.forEach(p => { if (p.nFreeY === undefined) p.nFreeY = _PY_N; });
        cls(); window.renderPotentials();
        if (typeof addHistory === 'function') addHistory('N-Position: ' + _POS_LABEL[nx]);
    });
    _on('pm-pev', e => {
        e.stopPropagation();
        if (!pot.hidePEOnPages) pot.hidePEOnPages = [];
        if (iHPE) pot.hidePEOnPages = pot.hidePEOnPages.filter(p => p !== cp);
        else      pot.hidePEOnPages.push(cp);
        cls(); window.renderPotentials();
        if (typeof addHistory === 'function') addHistory('PE-Sichtbarkeit geändert');
    });
    _on('pm-pep', e => {
        e.stopPropagation();
        const nx = _POS_NEXT[peP] || 'bottom';
        window.potentialSettings.pePosition = nx;
        if (nx === 'free') window.potentials.forEach(p => { if (p.peFreeY === undefined) p.peFreeY = _PY_PE; });
        cls(); window.renderPotentials();
        if (typeof addHistory === 'function') addHistory('PE-Position: ' + _POS_LABEL[nx]);
    });
    _on('pm-del', e => {
        e.stopPropagation();
        if (confirm('Potenzial wirklich löschen?\nWird von ALLEN Seiten entfernt.')) {
            window.potentials = window.potentials.filter(p => p.id !== pot.id);
            cls(); window.renderPotentials();
            if (typeof addHistory === 'function') addHistory('Potenzial gelöscht');
        }
    });

    setTimeout(() => {
        document.addEventListener('click', function closeHandler(e) {
            if (!menu.contains(e.target)) { cls(); document.removeEventListener('click', closeHandler); }
        });
    }, 60);
}

// ============================================================
// 12. FARB-DIALOG
// ============================================================
function _showColorDialog(pot) {
    const lbls  = _phases(pot);
    const cols  = pot.phaseColors || _COLORS_DEFAULT[parseInt(pot.phases)] || ['#1a1a1a'];
    const hints = { L1: 'IEC: Braun', L2: 'IEC: Schwarz', L3: 'IEC: Grau' };

    const dlg = document.createElement('div');
    dlg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;border:1px solid #bdc3c7;border-radius:8px;padding:25px;z-index:300000;min-width:310px;box-shadow:0 5px 20px rgba(0,0,0,0.3);font-family:Arial,sans-serif;';
    dlg.innerHTML = `
        <h3 style="margin:0 0 18px;color:#2c3e50;font-size:15px;">🎨 Phasenfarben</h3>
        ${lbls.map((l, i) => `
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                <span style="width:25px;font-weight:bold;font-size:13px;color:${cols[i] || '#1a1a1a'};">${l}</span>
                <input type="color" id="poc${i}" value="${cols[i] || '#1a1a1a'}" style="width:55px;height:32px;cursor:pointer;border:1px solid #bdc3c7;border-radius:4px;padding:2px;">
                <span style="font-size:11px;color:#95a5a6;">${hints[l] || ''}</span>
            </div>
        `).join('')}
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px;">
            <button id="poc-cancel" style="padding:8px 16px;border:1px solid #bdc3c7;background:#ecf0f1;cursor:pointer;border-radius:4px;">Abbrechen</button>
            <button id="poc-save"   style="padding:8px 16px;border:none;background:#2ecc71;color:white;cursor:pointer;border-radius:4px;font-weight:bold;">💾 Speichern</button>
        </div>
    `;
    document.body.appendChild(dlg);
    document.getElementById('poc-cancel').onclick = () => dlg.remove();
    document.getElementById('poc-save').onclick = () => {
        pot.phaseColors = lbls.map((_, i) => document.getElementById('poc' + i).value);
        dlg.remove();
        window.renderPotentials();
        if (typeof addHistory === 'function') addHistory('Potenzial-Farben geändert');
    };
}

// ============================================================
// 13. DROP-HANDLER (von bauteile.js aufgerufen)
// ============================================================
window.handlePotentialDrop = function (potType) {
    const phases = potType === 'pot_1phase' ? '1'
                 : potType === 'pot_2phase' ? '2'
                 : '3';
    window.potentials.push({
        id:           'pot_' + Date.now(),
        phases:       phases,
        name:         '',
        phaseColors:  [...(_COLORS_DEFAULT[parseInt(phases)] || ['#1a1a1a'])],
        hiddenOnPages:  [],
        hideNOnPages:   [],
        hidePEOnPages:  []
    });
    window.renderPotentials();
    if (typeof addHistory === 'function') addHistory('Potenzial hinzugefügt (' + phases + '-phasig)');
};

// ============================================================
// 14. INITIALISIERUNG
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof window.renderPotentials === 'function') window.renderPotentials();
    }, 400);
});