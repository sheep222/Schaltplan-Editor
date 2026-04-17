// www.kreativekiste.de // 14.04.2026 // Manager UI

window.ProjectManagerUI = {
    showDialog: function() {
        const projects = window.ProjectStorage.listProjects();

        // Vorhandene Dialoge entfernen
        const existing = document.getElementById('pm-dialog-overlay');
        if (existing) existing.remove();

        const dialog = document.createElement('div');
        dialog.id = 'pm-dialog-overlay';
        dialog.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(44, 62, 80, 0.8); display: flex;
            justify-content: center; align-items: center; z-index: 100000;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: white; border-radius: 8px; padding: 30px;
            width: 600px; max-height: 500px; overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        `;

        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center;
                        margin-bottom: 20px; border-bottom: 2px solid #ecf0f1; padding-bottom: 15px;">
                <h2 style="margin: 0; color: #2c3e50;">📂 Meine Projekte</h2>
                <button id="pm-close-btn" style="background: none; border: none; font-size: 24px; cursor: pointer;">✕</button>
            </div>
        `;

        if (projects.length === 0) {
            html += `<p style="text-align: center; color: #95a5a6; padding: 40px;">Noch keine Projekte gespeichert</p>`;
        } else {
            html += `<table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr style="background: #34495e; color: white; font-weight: bold;">
                    <th style="padding: 10px; text-align: left;   border: 1px solid #2c3e50;">Name</th>
                    <th style="padding: 10px; text-align: center; border: 1px solid #2c3e50;">Seiten</th>
                    <th style="padding: 10px; text-align: center; border: 1px solid #2c3e50; width: 140px;">Aktionen</th>
                </tr>`;

            projects.forEach(p => {
                // Projektname als data-Attribut – kein inline-JS mehr
                html += `
                    <tr style="border-bottom: 1px solid #ecf0f1;">
                        <td style="padding: 10px; border: 1px solid #ecf0f1;"><strong>${p.name}</strong></td>
                        <td style="padding: 10px; text-align: center; border: 1px solid #ecf0f1;">${p.pages}</td>
                        <td style="padding: 10px; text-align: center; border: 1px solid #ecf0f1;">
                            <button class="pm-load-btn"
                                data-name="${p.name}"
                                style="padding:4px 10px;background:#27ae60;color:white;border:none;border-radius:3px;cursor:pointer;margin-right:5px;">✓</button>
                            <button class="pm-export-btn"
                                data-name="${p.name}"
                                style="padding:4px 10px;background:#3498db;color:white;border:none;border-radius:3px;cursor:pointer;margin-right:5px;">📥</button>
                            <button class="pm-delete-btn"
                                data-name="${p.name}"
                                style="padding:4px 10px;background:#e74c3c;color:white;border:none;border-radius:3px;cursor:pointer;">🗑</button>
                        </td>
                    </tr>
                `;
            });
            html += `</table>`;
        }

        html += `
            <div style="display: flex; gap: 10px; justify-content: flex-end;
                        margin-top: 20px; padding-top: 15px; border-top: 1px solid #ecf0f1;">
                <button id="pm-import-btn" class="tool-btn" style="background: #8e44ad; color: white;">📂 Importieren</button>
                <button id="pm-cancel-btn" class="tool-btn" style="background: #95a5a6; color: white;">Schließen</button>
            </div>
        `;

        content.innerHTML = html;
        dialog.appendChild(content);
        document.body.appendChild(dialog);

        // ── Schließen ──
        const closeDialog = () => dialog.remove();

        document.getElementById('pm-close-btn').addEventListener('click', closeDialog);
        document.getElementById('pm-cancel-btn').addEventListener('click', closeDialog);

        // Klick außerhalb schließt Dialog
        dialog.addEventListener('click', e => { if (e.target === dialog) closeDialog(); });

        // ── Projekt LADEN ──
        content.querySelectorAll('.pm-load-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.dataset.name;
                // Dialog zuerst schließen, dann laden – verhindert DOM-Konflikte
                closeDialog();
                // Kurzes setTimeout damit der Dialog vollständig entfernt ist bevor
                // renderPotentials / drawFrame das DOM manipulieren
                setTimeout(() => {
                    window.ProjectStorage.loadProject(name);
                }, 50);
            });
        });

        // ── Projekt EXPORTIEREN ──
        content.querySelectorAll('.pm-export-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                window.ProjectStorage.exportProject(btn.dataset.name);
            });
        });

        // ── Projekt LÖSCHEN ──
        content.querySelectorAll('.pm-delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.ProjectStorage.deleteProject(btn.dataset.name)) {
                    closeDialog();
                    window.ProjectManagerUI.showDialog();
                }
            });
        });

        // ── IMPORTIEREN ──
        document.getElementById('pm-import-btn').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type   = 'file';
            input.accept = '.json';
            input.addEventListener('change', e => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = evt => {
                    if (window.ProjectStorage.importProject(evt.target.result)) {
                        alert('✅ Projekt importiert!');
                        closeDialog();
                        window.ProjectManagerUI.showDialog();
                    }
                };
                reader.readAsText(file);
            });
            input.click();
        });
    }
};