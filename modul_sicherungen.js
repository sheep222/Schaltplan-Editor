// www.kreativekiste.de // 08.04.2026 // Modul: Schutzorgane & Sicherungen

// Leitungsschutzschalter: Grafik aus leitungsschbutzschalter.svg (CorelDRAW), eingebettet
window.LSS_COREL_DEFS = '<defs><style type="text/css"><![CDATA[ .lss-str0{stroke:black;stroke-width:70.56;stroke-miterlimit:22.9256} .lss-str1{stroke:black;stroke-width:35.28;stroke-miterlimit:22.9256} .lss-str2{stroke:black;stroke-width:20;stroke-miterlimit:22.9256} .lss-fil0{fill:none} .lss-fil1{fill:black} ]]></style></defs>';
window.LSS_COREL_SCALE = 0.0115;
window.LSS_COREL_CX = 24297;
window.LSS_COREL_CY = 24127;
window.LSS_COREL_GRAPHIC = '<g class="lss-corel-art">' +
    '<path class="lss-fil0 lss-str0" d="M24997.93 22502.07l0 1500m-599.99 0l599.99 2000 -6.57 1498.59"/>' +
    '<line class="lss-fil0 lss-str0" x1="23297.93" y1="24752.07" x2="23297.93" y2="25752.07"/>' +
    '<polyline class="lss-fil0 lss-str0" points="24197.93,25252.07 24097.93,25252.07 23797.93,25752.07 23453.31,25252.07 23297.93,25252.07"/>' +
    '<line class="lss-fil0 lss-str0" x1="24747.93" y1="23252.07" x2="25247.93" y2="23752.07"/>' +
    '<line class="lss-fil0 lss-str0" x1="25247.93" y1="23252.07" x2="24747.93" y2="23752.07"/>' +
    '<line class="lss-fil0 lss-str0" x1="24697.93" y1="24002.07" x2="25297.93" y2="24002.07"/>' +
    '<line class="lss-fil0 lss-str0" x1="24359.07" y1="25252.07" x2="24559.07" y2="25252.07"/>' +
    '<polyline class="lss-fil0 lss-str1" points="24170.23,24918.33 24277.29,24871.38 24231.96,24768.02 24469.42,24663.87 24514.75,24767.23 24597.93,24730.75"/>' +
    '<g>' +
    '<polygon class="lss-fil1 lss-str2" points="24335.38,24419.84 24316.53,24380.9 24219.77,24475.79 24353.38,24457.04"/>' +
    '<line class="lss-fil0 lss-str2" x1="24473.66" y1="24351.82" x2="24240.33" y2="24464.76"/>' +
    '</g></g>';

// 1. Schmelzsicherung
window.ComponentRegistry.register('schmelzsicherung', {
    folder: 'sicherungen', // <-- Zuweisung zum HTML-Ordner
    title: 'Schmelzsicherung',
    defaultData: { poles: "1" },
    svg: `
        <svg viewBox="0 0 60 100" width="60" height="100" class="symbol">
            <line x1="30" y1="10" x2="30" y2="30" stroke="black" stroke-width="2"/>
            <rect x="22" y="30" width="16" height="40" fill="none" stroke="black" stroke-width="2"/>
            <line x1="30" y1="30" x2="30" y2="70" stroke="black" stroke-width="2"/>
            <line x1="30" y1="70" x2="30" y2="90" stroke="black" stroke-width="2"/>
            <circle cx="30" cy="10" r="4" fill="red" class="port"/>
            <circle cx="30" cy="90" r="4" fill="red" class="port"/>
            <text x="36" y="20" font-size="9" font-family="Arial">1</text>
            <text x="36" y="85" font-size="9" font-family="Arial">2</text>
        </svg>
    `
});

// 2. Leitungsschutzschalter (LSS)
window.ComponentRegistry.register('leitungsschutzschalter', {
    folder: 'sicherungen', // <-- Zuweisung zum HTML-Ordner
    title: 'Leitungsschutzschalter',
    defaultData: { poles: "1" },
    svg: '<svg viewBox="0 0 60 100" width="60" height="100" class="symbol" xmlns="http://www.w3.org/2000/svg">' +
        window.LSS_COREL_DEFS +
        '<g transform="translate(30 50) scale(' + window.LSS_COREL_SCALE + ') translate(' + (-window.LSS_COREL_CX) + ' ' + (-window.LSS_COREL_CY) + ')">' +
        window.LSS_COREL_GRAPHIC +
        '</g>' +
        '<circle cx="30" cy="10" r="4" fill="red" class="port"/>' +
        '<circle cx="30" cy="90" r="4" fill="red" class="port"/>' +
        '<text x="36" y="20" font-size="9" font-family="Arial">1</text>' +
        '<text x="36" y="85" font-size="9" font-family="Arial">2</text>' +
        '</svg>'
});

// 3. FI-Schutzschalter (inkl. L, N und PE Logik)
window.ComponentRegistry.register('fi_schutzschalter', {
    folder: 'sicherungen', // <-- Zuweisung zum HTML-Ordner
    title: 'FI-Schutzschalter (RCD)',
    defaultData: { poles: "1" }, 
    svg: `
        <svg viewBox="0 0 120 100" width="120" height="100" class="symbol">
            <line x1="30" y1="10" x2="30" y2="40" stroke="black" stroke-width="2"/>
            <line x1="22" y1="40" x2="30" y2="70" stroke="black" stroke-width="2"/>
            <line x1="30" y1="70" x2="30" y2="90" stroke="black" stroke-width="2"/>
            <circle cx="30" cy="10" r="4" fill="red" class="port"/>
            <circle cx="30" cy="90" r="4" fill="red" class="port"/>
            <text x="36" y="20" font-size="9" font-family="Arial">1</text>
            <text x="36" y="85" font-size="9" font-family="Arial">2</text>
            
            <line x1="60" y1="10" x2="60" y2="90" stroke="black" stroke-width="2"/>
            <circle cx="60" cy="10" r="4" fill="red" class="port"/>
            <circle cx="60" cy="90" r="4" fill="red" class="port"/>
            <text x="66" y="20" font-size="9" font-family="Arial">N</text>
            <text x="66" y="85" font-size="9" font-family="Arial">N</text>

            <line x1="90" y1="10" x2="90" y2="90" stroke="black" stroke-width="2" stroke-dasharray="8,4"/>
            <circle cx="90" cy="10" r="4" fill="red" class="port"/>
            <circle cx="90" cy="90" r="4" fill="red" class="port"/>
            <text x="96" y="20" font-size="9" font-family="Arial">PE</text>
            <text x="96" y="85" font-size="9" font-family="Arial">PE</text>

            <ellipse cx="45" cy="60" rx="20" ry="10" fill="none" stroke="black" stroke-width="2"/>
        </svg>
    `
});