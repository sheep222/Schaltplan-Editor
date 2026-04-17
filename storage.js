// www.kreativekiste.de // 14.04.2026 // Storage Management

// ============================================
// PROJEKTE SPEICHERN & LADEN
// ============================================
window.ProjectStorage = {
    STORAGE_KEY: 'schaltplan_projects',

    saveProject: function(projectName = null) {
        try {
            if (typeof saveCurrentPageState === 'function') {
                saveCurrentPageState();
            }

            const name = projectName || prompt('Projektname:', `Projekt_${new Date().toLocaleDateString()}`);
            if (!name) return false;

            const projectData = {
                name: name,
                timestamp: new Date().toISOString(),
                pages: typeof pages !== 'undefined' ? JSON.parse(JSON.stringify(pages)) : [],
                coilCounter: typeof coilCounter !== 'undefined' ? coilCounter : 1,
                numberingMode: window.numberingMode || 'din',
                potentials: window.potentials ? JSON.parse(JSON.stringify(window.potentials)) : [],
                potentialSettings: window.potentialSettings ? JSON.parse(JSON.stringify(window.potentialSettings)) : {},
                fCounter: window.fCounter || 1,
                qCounter: window.qCounter || 1,
                frameData: window.frameData || {}
            };

            let allProjects = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
            allProjects[name] = projectData;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allProjects));

            console.log(`✅ Projekt "${name}" gespeichert`);
            if (typeof addHistory === 'function') addHistory(`✅ "${name}" gespeichert`);
            return true;

        } catch (err) {
            console.error('Fehler beim Speichern:', err);
            alert('❌ Fehler beim Speichern!');
            return false;
        }
    },

    loadProject: function(projectName) {
        try {
            let allProjects = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
            const projectData = allProjects[projectName];

            if (!projectData) {
                alert(`❌ Projekt nicht gefunden!`);
                return false;
            }

            // 1. Zähler & Einstellungen zuerst setzen
            window.coilCounter = projectData.coilCounter || 1;
            if (typeof coilCounter !== 'undefined') coilCounter = window.coilCounter;
            window.numberingMode = projectData.numberingMode || 'din';
            window.potentials = JSON.parse(JSON.stringify(projectData.potentials || []));
            window.potentialSettings = JSON.parse(JSON.stringify(
                projectData.potentialSettings || { nPosition: 'bottom', pePosition: 'bottom' }
            ));
            window.fCounter = projectData.fCounter || 1;
            window.qCounter = projectData.qCounter || 1;
            window.frameData = JSON.parse(JSON.stringify(projectData.frameData || {}));

            // 2. pages-Array leeren und neu befüllen
            if (typeof pages !== 'undefined') {
                pages.length = 0;
                pages.push(...JSON.parse(JSON.stringify(projectData.pages)));
            }

            // 3. Canvas komplett leeren
            const area4 = document.getElementById('area-4');
            if (area4) {
                area4.querySelectorAll('.dropped-component').forEach(c => c.remove());
            }
            const wiringLayerEl = document.getElementById('wiring-layer');
            if (wiringLayerEl) wiringLayerEl.innerHTML = '';
            if (typeof connections !== 'undefined') connections.length = 0;

            // 4. Alle Sonder-Ansichten ausblenden, Canvas einblenden
            const deckblattView = document.getElementById('deckblatt-view');
            const ihvView       = document.getElementById('ihv-view');
            if (area4)          area4.classList.remove('hidden');
            if (deckblattView)  deckblattView.classList.add('hidden');
            if (ihvView)        ihvView.classList.add('hidden');

            // 5. Erste Seite direkt laden (NICHT über switchPage,
            //    da currentPageId in pages.js eine lokale Variable ist)
            const firstPageId = (pages && pages.length > 0) ? pages[0].id : 1;

            // Beide Variablen setzen – die globale UND die lokale aus pages.js
            window.currentPageId = firstPageId;
            // pages.js deklariert `currentPageId` als var im globalen Scope,
            // daher ist sie über window erreichbar:
            if (typeof currentPageId !== 'undefined') currentPageId = firstPageId;

            // 6. Tabs neu zeichnen
            if (typeof renderTabs === 'function') renderTabs();

            // 7. Seiten-Inhalt laden
            if (typeof loadPageState === 'function') loadPageState(firstPageId);

            // 8. Rahmen neu zeichnen
            if (typeof drawFrame === 'function') drawFrame();

            // 9. Potenziale rendern
            if (typeof window.renderPotentials === 'function') window.renderPotentials();

            console.log(`✅ Projekt "${projectName}" geladen`);
            if (typeof addHistory === 'function') addHistory(`✅ "${projectName}" geladen`);
            return true;

        } catch (err) {
            console.error('Fehler beim Laden:', err);
            alert('❌ Fehler beim Laden!');
            return false;
        }
    },

    listProjects: function() {
        let allProjects = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
        return Object.entries(allProjects).map(([name, data]) => ({
            name: name,
            timestamp: data.timestamp,
            pages: data.pages ? data.pages.length : 0
        })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },

    deleteProject: function(projectName) {
        if (!confirm(`⚠️ Projekt "${projectName}" wirklich löschen?`)) return false;
        
        let allProjects = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
        if (allProjects[projectName]) {
            delete allProjects[projectName];
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allProjects));
            console.log(`🗑 Projekt gelöscht`);
            if (typeof addHistory === 'function') addHistory(`🗑 Projekt gelöscht`);
            return true;
        }
        return false;
    },

    exportProject: function(projectName) {
        let allProjects = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
        if (!allProjects[projectName]) return false;

        const blob = new Blob([JSON.stringify(allProjects[projectName], null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName}.json`;
        a.click();
        URL.revokeObjectURL(url);
        return true;
    },

    importProject: function(jsonContent) {
        try {
            const projectData = JSON.parse(jsonContent);
            if (!projectData.pages || !Array.isArray(projectData.pages)) throw new Error('Invalid');

            const name = prompt('Projektname:', projectData.name || 'Importiert');
            if (!name) return false;

            let allProjects = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
            allProjects[name] = { ...projectData, name: name };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allProjects));
            console.log(`✅ Projekt importiert`);
            return true;
        } catch (err) {
            alert('❌ Datei ungültig!');
            return false;
        }
    }
};