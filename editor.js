// www.kreativekiste.de
// 13.04.2026
// Version 4.6

// --- CAD-TRICK & KLICK-SICHERHEIT ---
const editorStyle = document.createElement('style');
editorStyle.innerHTML = `
    #editor-scale-wrapper {
        user-select: none;
    }
    #editor-canvas { 
        cursor: crosshair; 
    }
    #editor-canvas * { 
        pointer-events: all !important; 
    }
`;
document.head.appendChild(editorStyle);

const fullscreenEditor = document.getElementById('fullscreen-editor');
const editorCanvas = document.getElementById('editor-canvas');
const toolBtns = document.querySelectorAll('#fullscreen-editor .editor-btn');

let currentTool = 'select';
let isDrawing = false;
let startX, startY;
let currentElement = null;

let editingComponent = null; 
let editingInstance = null;  

let selectedEditorElement = null;
let editorHandles = [];
let activeDragHandle = null;
const OUTPUT_VIEWBOX = '0 0 120 160';
const OUTPUT_WIDTH = 120;
const OUTPUT_HEIGHT = 160;
const OUTPUT_PADDING = 8;

// --- ZOOM LOGIK ---
let editorZoom = 1.0; 
const scaleWrapper = document.getElementById('editor-scale-wrapper');
const zoomLevelText = document.getElementById('editor-zoom-level');

function updateEditorZoom() {
    scaleWrapper.style.transform = `scale(${editorZoom})`;
    zoomLevelText.innerText = `${Math.round(editorZoom * 100)}%`;
}

document.getElementById('editor-zoom-in').addEventListener('click', () => { 
    editorZoom += 0.25; updateEditorZoom(); 
});
document.getElementById('editor-zoom-out').addEventListener('click', () => { 
    editorZoom = Math.max(0.25, editorZoom - 0.25); updateEditorZoom(); 
});

// --- RASTER & CODE COMPILER LOGIK ---
const codePanel = document.getElementById('editor-code-panel');
const codeOutput = document.getElementById('editor-code-output');

document.getElementById('btn-editor-grid').addEventListener('click', (e) => {
    const gridBg = document.getElementById('editor-grid-bg');
    if (gridBg.style.display === 'none') {
        gridBg.style.display = 'block';
        e.currentTarget.style.backgroundColor = '#f39c12';
        e.currentTarget.style.color = 'black';
    } else {
        gridBg.style.display = 'none';
        e.currentTarget.style.backgroundColor = '#7f8c8d';
        e.currentTarget.style.color = 'white';
    }
});

document.getElementById('btn-toggle-code').addEventListener('click', () => {
    codePanel.classList.toggle('hidden');
    updateCodePreview();
});

document.getElementById('btn-close-code').addEventListener('click', () => {
    codePanel.classList.add('hidden');
});

function updateCodePreview() {
    if (codePanel.classList.contains('hidden')) return;
    
    const tempElement = selectedEditorElement;
    if (tempElement) tempElement.removeAttribute('opacity');
    
    let svgContent = editorCanvas.innerHTML.trim();
    
    if (tempElement) tempElement.setAttribute('opacity', '0.4');

    svgContent = svgContent.replace(/></g, '>\n  <');
    if (svgContent.length > 0) {
        svgContent = "  " + svgContent;
    }

    const fullCode = `<svg viewBox="${OUTPUT_VIEWBOX}" width="${OUTPUT_WIDTH}" height="${OUTPUT_HEIGHT}" class="symbol">\n${svgContent}\n</svg>`;
    codeOutput.value = fullCode;
}

function normalizeEditorContentToComponentSvg(rawInnerHtml) {
    if (!rawInnerHtml || !rawInnerHtml.trim()) return '';

    const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    tempSvg.setAttribute('width', OUTPUT_WIDTH);
    tempSvg.setAttribute('height', OUTPUT_HEIGHT);
    tempSvg.setAttribute('viewBox', '-340 -320 800 800');
    tempSvg.style.position = 'absolute';
    tempSvg.style.left = '-99999px';
    tempSvg.style.top = '-99999px';
    tempSvg.style.visibility = 'hidden';
    tempSvg.innerHTML = rawInnerHtml;
    document.body.appendChild(tempSvg);

    let bbox = null;
    try {
        bbox = tempSvg.getBBox();
    } catch (err) {
        document.body.removeChild(tempSvg);
        return rawInnerHtml;
    }
    document.body.removeChild(tempSvg);

    const bw = Math.max(bbox.width || 0, 1);
    const bh = Math.max(bbox.height || 0, 1);
    const scaleX = (OUTPUT_WIDTH - OUTPUT_PADDING * 2) / bw;
    const scaleY = (OUTPUT_HEIGHT - OUTPUT_PADDING * 2) / bh;
    const scale = Math.max(Math.min(scaleX, scaleY), 0.01);
    const offsetX = (OUTPUT_WIDTH - bw * scale) / 2 - bbox.x * scale;
    const offsetY = (OUTPUT_HEIGHT - bh * scale) / 2 - bbox.y * scale;

    return `<g transform="translate(${offsetX.toFixed(3)} ${offsetY.toFixed(3)}) scale(${scale.toFixed(5)})">${rawInnerHtml}</g>`;
}

document.getElementById('btn-copy-code').addEventListener('click', () => {
    navigator.clipboard.writeText(codeOutput.value).then(() => {
        const btn = document.getElementById('btn-copy-code');
        btn.innerText = "✅ Kopiert!";
        setTimeout(() => { btn.innerText = "📋 Kopieren"; }, 2000);
    });
});

document.getElementById('btn-download-code').addEventListener('click', () => {
    const blob = new Blob([codeOutput.value], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mein_bauteil.html';
    a.click();
    URL.revokeObjectURL(url);
});


// Öffnet den Editor für ein leeres, neues Bauteil
document.getElementById('btn-new-comp').addEventListener('click', () => {
    editingComponent = null;
    editingInstance = null;
    editorCanvas.innerHTML = ''; 
    deselectElement();
    
    toolBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('.editor-btn[data-tool="line"]').classList.add('active');
    currentTool = 'line';
    
    fullscreenEditor.classList.remove('hidden');
    updateCodePreview();
});

document.getElementById('btn-close-editor').addEventListener('click', () => {
    deselectElement();
    fullscreenEditor.classList.add('hidden');
});

toolBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        toolBtns.forEach(b => {
            b.classList.remove('active');
            b.style.backgroundColor = '';
            b.style.color = '';
        });
        
        e.currentTarget.classList.add('active');
        if (e.currentTarget.dataset.tool === 'select') {
            e.currentTarget.style.backgroundColor = '#f1c40f';
            e.currentTarget.style.color = 'black';
        } else if (e.currentTarget.dataset.tool === 'add-point') {
            e.currentTarget.style.backgroundColor = '#2ecc71';
            e.currentTarget.style.color = 'white';
        } else {
            e.currentTarget.style.backgroundColor = '#34495e';
            e.currentTarget.style.color = 'white';
        }
        
        currentTool = e.currentTarget.dataset.tool;
        deselectElement();
    });
});

// Berechnet die Maus-Koordinaten und erzwingt das 5px Raster!
function getMouseCoords(e) {
    const pt = editorCanvas.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    
    const ctm = editorCanvas.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 }; 
    
    const cursor = pt.matrixTransform(ctm.inverse());
    
    // Zwingt alle Klicks absolut gnadenlos auf das 5px Kästchen-Raster
    let x = Math.round(cursor.x / 5) * 5;
    let y = Math.round(cursor.y / 5) * 5;
    
    return { x, y };
}

// Mathe-Hilfsfunktionen, um herauszufinden, auf welchen Teil der Linie geklickt wurde
function sqr(x) { return x * x }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
function distToSegmentSquared(p, v, w) {
    let l2 = dist2(v, w);
    if (l2 === 0) return dist2(p, v);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
}

scaleWrapper.addEventListener('mousedown', (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault(); 
    }

    const tag = e.target.tagName.toLowerCase();
    const isShape = ['line', 'rect', 'circle', 'path', 'polygon', 'polyline', 'text'].includes(tag);
    const coords = getMouseCoords(e);

    // --- NEUES WERKZEUG: Punkt einfügen ---
    if (currentTool === 'add-point') {
        if (isShape && e.target !== editorCanvas) {
            
            // 1. Aus einer simplen Linie eine verknüpfte Form (Polyline) machen
            if (tag === 'line') {
                const x1 = parseFloat(e.target.getAttribute('x1'));
                const y1 = parseFloat(e.target.getAttribute('y1'));
                const x2 = parseFloat(e.target.getAttribute('x2'));
                const y2 = parseFloat(e.target.getAttribute('y2'));
                
                const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
                poly.setAttribute('points', `${x1},${y1} ${coords.x},${coords.y} ${x2},${y2}`);
                poly.setAttribute('stroke', e.target.getAttribute('stroke') || 'black');
                poly.setAttribute('stroke-width', e.target.getAttribute('stroke-width') || '2');
                poly.setAttribute('fill', e.target.getAttribute('fill') || 'none');
                if (e.target.hasAttribute('stroke-dasharray')) {
                    poly.setAttribute('stroke-dasharray', e.target.getAttribute('stroke-dasharray'));
                }
                
                e.target.parentNode.replaceChild(poly, e.target);
                
                // Setze Werkzeug zurück auf Auswählen und aktiviere die neue Form
                document.querySelector('.editor-btn[data-tool="select"]').click();
                selectElement(poly);
                updateCodePreview();
                return;
            } 
            // 2. Zu einem bestehenden Polygon/Polyline einen neuen Punkt hinzufügen
            else if (tag === 'polyline' || tag === 'polygon') {
                let ptsStr = e.target.getAttribute('points').trim();
                let ptsArr = ptsStr.replace(/,/g, ' ').split(/\s+/).filter(p => p !== '').map(Number);
                let pts = [];
                for(let i = 0; i < ptsArr.length; i += 2) {
                    pts.push({x: ptsArr[i], y: ptsArr[i+1]});
                }
                
                let minDist = Infinity;
                let insertIdx = 0;
                let numPoints = pts.length;
                let loopCount = tag === 'polygon' ? numPoints : numPoints - 1;

                // Finde heraus, an welcher Stelle der Punkt exakt eingefügt werden muss
                for (let i = 0; i < loopCount; i++) {
                    let p1 = pts[i];
                    let p2 = pts[(i + 1) % numPoints];
                    let d = distToSegmentSquared({x: coords.x, y: coords.y}, p1, p2);
                    if (d < minDist) {
                        minDist = d;
                        insertIdx = i + 1;
                    }
                }
                
                // Füge Punkt in das Array ein und baue die Form neu
                pts.splice(insertIdx, 0, {x: coords.x, y: coords.y});
                let newPtsStr = pts.map(p => `${p.x},${p.y}`).join(' ');
                e.target.setAttribute('points', newPtsStr);
                
                document.querySelector('.editor-btn[data-tool="select"]').click();
                selectElement(e.target);
                updateCodePreview();
                return;
            }
        }
        return; 
    }

    // --- STANDARD AUSWÄHLEN WERKZEUG ---
    if (currentTool === 'select') {
        if (isShape && e.target !== editorCanvas) {
            selectElement(e.target);
            setupElementMove(e.target, coords); 
        } else {
            deselectElement();
        }
        return;
    }

    deselectElement();
    isDrawing = true;
    startX = coords.x; startY = coords.y;

    const isFilled = document.getElementById('tool-fill').checked;
    const isDashed = document.getElementById('tool-dashed').checked;
    const fillValue = isFilled ? 'black' : 'none';
    const dashValue = isDashed ? '4,4' : 'none';

    if (currentTool === 'line') {
        currentElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        currentElement.setAttribute('x1', startX); currentElement.setAttribute('y1', startY);
        currentElement.setAttribute('x2', startX); currentElement.setAttribute('y2', startY);
        currentElement.setAttribute('stroke', 'black'); currentElement.setAttribute('stroke-width', '2');
        if (isDashed) currentElement.setAttribute('stroke-dasharray', dashValue);
    } else if (currentTool === 'rect') {
        currentElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        currentElement.setAttribute('x', startX); currentElement.setAttribute('y', startY);
        currentElement.setAttribute('width', '0'); currentElement.setAttribute('height', '0');
        currentElement.setAttribute('fill', fillValue); currentElement.setAttribute('stroke', 'black'); currentElement.setAttribute('stroke-width', '2');
        if (isDashed) currentElement.setAttribute('stroke-dasharray', dashValue);
    } else if (currentTool === 'circle') {
        currentElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        currentElement.setAttribute('cx', startX); currentElement.setAttribute('cy', startY);
        currentElement.setAttribute('r', '0');
        currentElement.setAttribute('fill', fillValue); currentElement.setAttribute('stroke', 'black'); currentElement.setAttribute('stroke-width', '2');
        if (isDashed) currentElement.setAttribute('stroke-dasharray', dashValue);
    } else if (currentTool === 'triangle') {
        currentElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        currentElement.setAttribute('fill', fillValue); currentElement.setAttribute('stroke', 'black'); currentElement.setAttribute('stroke-width', '2');
        if (isDashed) currentElement.setAttribute('stroke-dasharray', dashValue);
    } else if (currentTool === 'semicircle') {
        currentElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        currentElement.setAttribute('fill', fillValue); currentElement.setAttribute('stroke', 'black'); currentElement.setAttribute('stroke-width', '2');
        if (isDashed) currentElement.setAttribute('stroke-dasharray', dashValue);
    } else if (currentTool === 'arrow') {
        currentElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        currentElement.setAttribute('fill', 'none'); currentElement.setAttribute('stroke', 'black'); currentElement.setAttribute('stroke-width', '2');
        if (isDashed) currentElement.setAttribute('stroke-dasharray', dashValue);
    } else if (currentTool === 'port') {
        currentElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        currentElement.setAttribute('cx', startX); currentElement.setAttribute('cy', startY);
        currentElement.setAttribute('r', '4');
        currentElement.setAttribute('fill', 'red'); currentElement.setAttribute('class', 'port');
        editorCanvas.appendChild(currentElement);
        isDrawing = false; 
        updateCodePreview();
        return;
    } else if (currentTool === 'text') {
        const txt = prompt("Text eingeben:");
        if (txt) {
            currentElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            currentElement.setAttribute('x', startX); currentElement.setAttribute('y', startY);
            currentElement.setAttribute('font-size', '10'); currentElement.setAttribute('font-family', 'Arial');
            currentElement.style.userSelect = 'none';
            currentElement.textContent = txt;
            editorCanvas.appendChild(currentElement);
        }
        isDrawing = false; 
        updateCodePreview();
        return;
    }
    
    if (currentElement) editorCanvas.appendChild(currentElement);
});

document.addEventListener('mousemove', (e) => {
    if (fullscreenEditor.classList.contains('hidden')) return;

    const coords = getMouseCoords(e);
    if (activeDragHandle) { activeDragHandle(coords.x, coords.y); return; }

    if (isDrawing && currentElement) {
        if (currentTool === 'line') {
            const rawDx = coords.x - startX;
            const rawDy = coords.y - startY;
            const distance = Math.hypot(rawDx, rawDy);
            const rawAngle = Math.atan2(rawDy, rawDx);
            
            // Zwingt die Linie auf perfekt berechnete 30 Grad Winkel!
            const snappedAngle = Math.round(rawAngle / (Math.PI / 6)) * (Math.PI / 6);
            
            const endX = startX + distance * Math.cos(snappedAngle);
            const endY = startY + distance * Math.sin(snappedAngle);
            
            currentElement.setAttribute('x2', Math.round(endX * 100) / 100);
            currentElement.setAttribute('y2', Math.round(endY * 100) / 100);

        } else if (currentTool === 'rect') {
            const width = coords.x - startX; const height = coords.y - startY;
            currentElement.setAttribute('x', width < 0 ? coords.x : startX);
            currentElement.setAttribute('y', height < 0 ? coords.y : startY);
            currentElement.setAttribute('width', Math.abs(width));
            currentElement.setAttribute('height', Math.abs(height));
        } else if (currentTool === 'circle') {
            const r = Math.sqrt(Math.pow(coords.x - startX, 2) + Math.pow(coords.y - startY, 2));
            currentElement.setAttribute('r', r);
        } else if (currentTool === 'triangle') {
            const midX = startX + (coords.x - startX) / 2;
            currentElement.setAttribute('points', `${startX},${coords.y} ${coords.x},${coords.y} ${midX},${startY}`);
        } else if (currentTool === 'semicircle') {
            const rx = Math.abs(coords.x - startX) / 2;
            const ry = Math.abs(coords.y - startY);
            const sweep = coords.x > startX ? 1 : 0; 
            currentElement.setAttribute('d', `M ${startX} ${coords.y} A ${rx} ${ry} 0 0 ${sweep} ${coords.x} ${coords.y} Z`);
        } else if (currentTool === 'arrow') {
            const angle = Math.atan2(coords.y - startY, coords.x - startX);
            const headlen = 10;
            const x1 = coords.x - headlen * Math.cos(angle - Math.PI / 6);
            const y1 = coords.y - headlen * Math.sin(angle - Math.PI / 6);
            const x2 = coords.x - headlen * Math.cos(angle + Math.PI / 6);
            const y2 = coords.y - headlen * Math.sin(angle + Math.PI / 6);
            currentElement.setAttribute('d', `M ${startX} ${startY} L ${coords.x} ${coords.y} M ${coords.x} ${coords.y} L ${x1} ${y1} M ${coords.x} ${coords.y} L ${x2} ${y2}`);
        }
    }
});

document.addEventListener('mouseup', () => { 
    if (isDrawing || activeDragHandle) {
        isDrawing = false; 
        currentElement = null; 
        activeDragHandle = null;
        updateCodePreview();
    }
});

document.getElementById('btn-delete-element').addEventListener('click', () => {
    if (selectedEditorElement) { 
        selectedEditorElement.remove(); 
        deselectElement(); 
        updateCodePreview();
    }
});

document.addEventListener('keydown', (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && (!fullscreenEditor.classList.contains('hidden')) && selectedEditorElement) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault(); 
            selectedEditorElement.remove(); 
            deselectElement();
            updateCodePreview();
        }
    }
});

function deselectElement() {
    if (selectedEditorElement) { 
        selectedEditorElement.removeAttribute('opacity'); 
    }
    selectedEditorElement = null;
    editorHandles.forEach(h => h.remove()); editorHandles = [];
}

function selectElement(el) {
    deselectElement(); 
    selectedEditorElement = el; 
    el.setAttribute('opacity', '0.4'); 
    renderHandles();
}

function renderHandles() {
    editorHandles.forEach(h => h.remove()); editorHandles = [];
    const el = selectedEditorElement; if (!el) return;
    const tag = el.tagName.toLowerCase();
    
    if (tag === 'line') {
        createHandle(parseFloat(el.getAttribute('x1'))||0, parseFloat(el.getAttribute('y1'))||0, (nx, ny) => { el.setAttribute('x1', nx); el.setAttribute('y1', ny); renderHandles(); updateCodePreview(); });
        createHandle(parseFloat(el.getAttribute('x2'))||0, parseFloat(el.getAttribute('y2'))||0, (nx, ny) => { el.setAttribute('x2', nx); el.setAttribute('y2', ny); renderHandles(); updateCodePreview(); });
    } else if (tag === 'rect') {
        const x = parseFloat(el.getAttribute('x'))||0; const y = parseFloat(el.getAttribute('y'))||0;
        const w = parseFloat(el.getAttribute('width'))||0; const h = parseFloat(el.getAttribute('height'))||0;
        createHandle(x, y, (nx, ny) => { el.setAttribute('x', nx); el.setAttribute('y', ny); el.setAttribute('width', Math.max(1, w + (x - nx))); el.setAttribute('height', Math.max(1, h + (y - ny))); renderHandles(); updateCodePreview(); });
        createHandle(x + w, y + h, (nx, ny) => { el.setAttribute('width', Math.max(1, nx - x)); el.setAttribute('height', Math.max(1, ny - y)); renderHandles(); updateCodePreview(); });
    } else if (tag === 'circle') {
        const cx = parseFloat(el.getAttribute('cx'))||0; const cy = parseFloat(el.getAttribute('cy'))||0;
        if (!el.classList.contains('port')) {
            const r = parseFloat(el.getAttribute('r'))||0;
            createHandle(cx + r, cy, (nx, ny) => { el.setAttribute('r', Math.max(1, Math.abs(nx - cx))); renderHandles(); updateCodePreview(); }); 
        }
    } 
    // --- NEU: Anfasser für alle Vektor-Punkte einer Form erstellen ---
    else if (tag === 'polyline' || tag === 'polygon') {
        let ptsStr = el.getAttribute('points').trim();
        let ptsArr = ptsStr.replace(/,/g, ' ').split(/\s+/).filter(p => p !== '').map(Number);
        
        for (let i = 0; i < ptsArr.length; i += 2) {
            let px = ptsArr[i];
            let py = ptsArr[i+1];
            let ptIndex = i; 
            
            createHandle(px, py, (nx, ny) => {
                let currPtsArr = el.getAttribute('points').replace(/,/g, ' ').split(/\s+/).filter(p => p !== '').map(Number);
                currPtsArr[ptIndex] = nx;
                currPtsArr[ptIndex + 1] = ny;
                
                let newPtsStr = [];
                for(let j = 0; j < currPtsArr.length; j += 2) {
                    newPtsStr.push(`${currPtsArr[j]},${currPtsArr[j+1]}`);
                }
                el.setAttribute('points', newPtsStr.join(' '));
                renderHandles();
                updateCodePreview();
            });
        }
    }
}

function createHandle(x, y, onDrag) {
    const h = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    h.setAttribute('cx', x); h.setAttribute('cy', y); h.setAttribute('r', '3');
    h.setAttribute('fill', '#e74c3c'); h.setAttribute('stroke', '#fff'); h.setAttribute('stroke-width', '1');
    h.style.cursor = 'move';
    h.addEventListener('mousedown', (e) => { e.stopPropagation(); if (currentTool !== 'select') return; activeDragHandle = onDrag; });
    editorCanvas.appendChild(h); editorHandles.push(h);
}

function setupElementMove(el, startCoords) {
    const tag = el.tagName.toLowerCase(); let initData = {};
    if (tag === 'line') { initData = { x1: parseFloat(el.getAttribute('x1'))||0, y1: parseFloat(el.getAttribute('y1'))||0, x2: parseFloat(el.getAttribute('x2'))||0, y2: parseFloat(el.getAttribute('y2'))||0 }; } 
    else if (tag === 'rect' || tag === 'text') { initData = { x: parseFloat(el.getAttribute('x'))||0, y: parseFloat(el.getAttribute('y'))||0 }; } 
    else if (tag === 'circle') { initData = { cx: parseFloat(el.getAttribute('cx'))||0, cy: parseFloat(el.getAttribute('cy'))||0 }; } 
    else if (tag === 'polyline' || tag === 'polygon') {
        initData = { pts: el.getAttribute('points').replace(/,/g, ' ').split(/\s+/).filter(p => p !== '').map(Number) };
    }
    else {
        const transform = el.getAttribute('transform') || ''; const match = transform.match(/translate\(([-\d.]+),\s*([-\d.]+)\)/);
        initData = { tx: match ? parseFloat(match[1]) : 0, ty: match ? parseFloat(match[2]) : 0, originalTransform: transform.replace(/translate\([-\d.]+,\s*[-\d.]+\)/g, '').trim() };
    }
    activeDragHandle = (nx, ny) => {
        const dx = nx - startCoords.x; const dy = ny - startCoords.y;
        if (tag === 'line') { el.setAttribute('x1', initData.x1 + dx); el.setAttribute('y1', initData.y1 + dy); el.setAttribute('x2', initData.x2 + dx); el.setAttribute('y2', initData.y2 + dy); } 
        else if (tag === 'rect' || tag === 'text') { el.setAttribute('x', initData.x + dx); el.setAttribute('y', initData.y + dy); } 
        else if (tag === 'circle') { el.setAttribute('cx', initData.cx + dx); el.setAttribute('cy', initData.cy + dy); } 
        else if (tag === 'polyline' || tag === 'polygon') {
            let newPts = [];
            for (let i = 0; i < initData.pts.length; i += 2) {
                newPts.push(`${initData.pts[i] + dx},${initData.pts[i+1] + dy}`);
            }
            el.setAttribute('points', newPts.join(' '));
        }
        else { el.setAttribute('transform', `translate(${initData.tx + dx}, ${initData.ty + dy}) ${initData.originalTransform}`.trim()); }
        renderHandles();
    };
}

document.getElementById('btn-save-comp').addEventListener('click', () => {
    deselectElement();
    const normalizedContent = normalizeEditorContentToComponentSvg(editorCanvas.innerHTML);
    if (editingInstance) {
        const svg = editingInstance.querySelector('svg') || editingInstance.querySelector('svg.symbol');
        if (svg) {
            svg.classList.add('symbol');
            svg.setAttribute('viewBox', OUTPUT_VIEWBOX);
            svg.setAttribute('width', OUTPUT_WIDTH);
            svg.setAttribute('height', OUTPUT_HEIGHT);
            svg.innerHTML = normalizedContent;
        }
        if(typeof updateCables === 'function') updateCables(); addHistory('Bauteil auf Plan geändert');
    } else if (editingComponent) {
        const svg = editingComponent.querySelector('svg') || editingComponent.querySelector('svg.symbol');
        if (svg) {
            svg.classList.add('symbol');
            svg.setAttribute('viewBox', OUTPUT_VIEWBOX);
            svg.setAttribute('width', OUTPUT_WIDTH);
            svg.setAttribute('height', OUTPUT_HEIGHT);
            svg.innerHTML = normalizedContent;
        }
        addHistory('Vorlage geändert');
    } else {
        const newDiv = document.createElement('div'); newDiv.className = 'component-item'; newDiv.draggable = true; newDiv.dataset.type = 'custom';
        newDiv.innerHTML = `<button class="edit-comp-btn" title="Bauteil bearbeiten">✏️</button><svg viewBox="${OUTPUT_VIEWBOX}" width="${OUTPUT_WIDTH}" height="${OUTPUT_HEIGHT}" class="symbol" xmlns="http://www.w3.org/2000/svg">${normalizedContent}</svg>`;
        newDiv.addEventListener('dragstart', (e) => { draggedHTML = e.currentTarget.querySelector('svg').outerHTML; draggedType = 'custom'; e.dataTransfer.setData('text/plain', ''); });
        
        const area3 = document.getElementById('area-3');
        if(area3) area3.appendChild(newDiv);
        addHistory('Neues Bauteil erstellt');
    }
    fullscreenEditor.classList.add('hidden');
});

// --- GLOBALE EDITOR FUNKTIONEN ---
window.openEditorForComponent = function(compEl) {
    const myCanvas = document.getElementById('editor-canvas');
    if (!fullscreenEditor || !myCanvas) return;
    
    editingComponent = compEl; 
    editingInstance = null; 
    
    const svgEl = editingComponent.querySelector('svg.symbol');
    if (svgEl) {
        myCanvas.innerHTML = svgEl.innerHTML;
    }
    
    toolBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('.editor-btn[data-tool="select"]').classList.add('active');
    currentTool = 'select';
    
    fullscreenEditor.classList.remove('hidden');
    updateCodePreview();
}

window.openEditorForInstance = function(el) {
    const myCanvas = document.getElementById('editor-canvas');
    if (!fullscreenEditor || !myCanvas) return;
    
    editingComponent = null; 
    editingInstance = el;
    
    const svgEl = el.querySelector('svg.symbol');
    if (svgEl) {
        myCanvas.innerHTML = svgEl.innerHTML;
    }
    
    toolBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('.editor-btn[data-tool="select"]').classList.add('active');
    currentTool = 'select';
    
    fullscreenEditor.classList.remove('hidden');
    updateCodePreview();
}

// --- EVENT DELEGATION ---
document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-comp-btn');
    if (editBtn) {
        e.stopPropagation(); 
        e.preventDefault();  
        
        const compItem = editBtn.closest('.component-item');
        if (compItem) {
            window.openEditorForComponent(compItem);
            if (typeof addHistory === 'function') addHistory('Editor für Vorlage geöffnet');
        }
    }
}, true);