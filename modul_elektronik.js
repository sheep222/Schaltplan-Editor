// www.kreativekiste.de // 15.04.2026 // Modul: Elektronik

// 1. Widerstand (DIN EN 60617: Rechteck)
window.ComponentRegistry.register('widerstand', {
    folder: 'elektronik',
    title: 'Widerstand',
    defaultData: {},
    svg: `
        <svg viewBox="0 0 60 100" width="60" height="100" class="symbol">
            <line x1="30" y1="10" x2="30" y2="30" stroke="black" stroke-width="2"/>
            <rect x="14" y="30" width="32" height="40" fill="none" stroke="black" stroke-width="2"/>
            <line x1="30" y1="70" x2="30" y2="90" stroke="black" stroke-width="2"/>
            <circle cx="30" cy="10" r="4" fill="red" class="port"/>
            <circle cx="30" cy="90" r="4" fill="red" class="port"/>
        </svg>
    `
});

// 2. LED (Leuchtdiode)
window.ComponentRegistry.register('led', {
    folder: 'elektronik',
    title: 'LED',
    defaultData: {},
    svg: `
        <svg viewBox="0 0 60 100" width="60" height="100" class="symbol">
            <line x1="30" y1="10" x2="30" y2="35" stroke="black" stroke-width="2"/>
            <polygon points="16,35 44,35 30,60" fill="none" stroke="black" stroke-width="2"/>
            <line x1="16" y1="60" x2="44" y2="60" stroke="black" stroke-width="2"/>
            <line x1="30" y1="60" x2="30" y2="90" stroke="black" stroke-width="2"/>
            <!-- Licht-Pfeile -->
            <line x1="40" y1="42" x2="52" y2="30" stroke="black" stroke-width="1.5"/>
            <polygon points="52,30 46,32 50,38" fill="black"/>
            <line x1="45" y1="50" x2="57" y2="38" stroke="black" stroke-width="1.5"/>
            <polygon points="57,38 51,40 55,46" fill="black"/>
            <circle cx="30" cy="10" r="4" fill="red" class="port"/>
            <circle cx="30" cy="90" r="4" fill="red" class="port"/>
        </svg>
    `
});

// 3. Diode
window.ComponentRegistry.register('diode', {
    folder: 'elektronik',
    title: 'Diode',
    defaultData: {},
    svg: `
        <svg viewBox="0 0 60 100" width="60" height="100" class="symbol">
            <line x1="30" y1="10" x2="30" y2="35" stroke="black" stroke-width="2"/>
            <polygon points="16,35 44,35 30,60" fill="none" stroke="black" stroke-width="2"/>
            <line x1="16" y1="60" x2="44" y2="60" stroke="black" stroke-width="2"/>
            <line x1="30" y1="60" x2="30" y2="90" stroke="black" stroke-width="2"/>
            
            <circle cx="30" cy="10" r="4" fill="red" class="port"/>
            <circle cx="30" cy="90" r="4" fill="red" class="port"/>
        </svg>
    `
});

// 4. Transistor NPN
window.ComponentRegistry.register('transistor_npn', {
    folder: 'elektronik',
    title: 'Transistor NPN',
    defaultData: {},
    svg: `
        <svg viewBox="0 0 80 100" width="80" height="100" class="symbol">
            <!-- Basis -->
            <line x1="10" y1="50" x2="30" y2="50" stroke="black" stroke-width="2"/>
            <!-- Basis-Linie vertikal -->
            <line x1="30" y1="30" x2="30" y2="70" stroke="black" stroke-width="3"/>
            <!-- Kollektor -->
            <line x1="30" y1="35" x2="55" y2="15" stroke="black" stroke-width="2"/>
            <!-- Emitter mit Pfeil (NPN: Pfeil zeigt weg) -->
            <line x1="30" y1="65" x2="55" y2="85" stroke="black" stroke-width="2"/>
            <polygon points="52,80 58,88 48,86" fill="black"/>
            <!-- Anschlüsse -->
            <circle cx="10" cy="50" r="4" fill="red" class="port"/>
            <circle cx="60" cy="10" r="4" fill="red" class="port"/>
            <circle cx="60" cy="90" r="4" fill="red" class="port"/>
            <!-- Beschriftungen -->
            <text x="62" y="14" font-size="9" font-family="Arial">C</text>
            <text x="62" y="94" font-size="9" font-family="Arial">E</text>
            <text x="2" y="46" font-size="9" font-family="Arial">B</text>
            <!-- Kreis um Transistor -->
            <circle cx="42" cy="50" r="28" fill="none" stroke="black" stroke-width="1.5"/>
        </svg>
    `
});

// 5. Transistor PNP
window.ComponentRegistry.register('transistor_pnp', {
    folder: 'elektronik',
    title: 'Transistor PNP',
    defaultData: {},
    svg: `
        <svg viewBox="0 0 80 100" width="80" height="100" class="symbol">
            <!-- Basis -->
            <line x1="10" y1="50" x2="30" y2="50" stroke="black" stroke-width="2"/>
            <!-- Basis-Linie vertikal -->
            <line x1="30" y1="30" x2="30" y2="70" stroke="black" stroke-width="3"/>
            <!-- Kollektor -->
            <line x1="30" y1="35" x2="55" y2="15" stroke="black" stroke-width="2"/>
            <!-- Emitter mit Pfeil (PNP: Pfeil zeigt zur Basis) -->
            <line x1="30" y1="65" x2="55" y2="85" stroke="black" stroke-width="2"/>
            <polygon points="32,67 30,78 40,72" fill="black"/>
            <!-- Anschlüsse -->
            <circle cx="10" cy="50" r="4" fill="red" class="port"/>
            <circle cx="60" cy="10" r="4" fill="red" class="port"/>
            <circle cx="60" cy="90" r="4" fill="red" class="port"/>
            <!-- Beschriftungen -->
            <text x="62" y="14" font-size="9" font-family="Arial">C</text>
            <text x="62" y="94" font-size="9" font-family="Arial">E</text>
            <text x="2" y="46" font-size="9" font-family="Arial">B</text>
            <!-- Kreis -->
            <circle cx="42" cy="50" r="28" fill="none" stroke="black" stroke-width="1.5"/>
        </svg>
    `
});

// 6. LDR (Lichtabhängiger Widerstand)
window.ComponentRegistry.register('ldr', {
    folder: 'elektronik',
    title: 'LDR (Fotowiderstand)',
    defaultData: {},
    svg: `
        <svg viewBox="0 0 60 100" width="60" height="100" class="symbol">
            <line x1="30" y1="10" x2="30" y2="30" stroke="black" stroke-width="2"/>
            <rect x="14" y="30" width="32" height="40" fill="none" stroke="black" stroke-width="2"/>
            <line x1="30" y1="70" x2="30" y2="90" stroke="black" stroke-width="2"/>
            <!-- Licht-Pfeile (eingehend, nach unten links) -->
            <line x1="48" y1="18" x2="38" y2="32" stroke="black" stroke-width="1.5"/>
            <polygon points="38,32 44,26 42,34" fill="black"/>
            <line x1="55" y1="25" x2="45" y2="39" stroke="black" stroke-width="1.5"/>
            <polygon points="45,39 51,33 49,41" fill="black"/>
            <!-- Pfeil quer (variabel) -->
            <line x1="8" y1="75" x2="52" y2="25" stroke="black" stroke-width="1.5"/>
            <polygon points="52,25 44,28 50,34" fill="black"/>
            <circle cx="30" cy="10" r="4" fill="red" class="port"/>
            <circle cx="30" cy="90" r="4" fill="red" class="port"/>
        </svg>
    `
});

// 7. Potentiometer (Poti)
window.ComponentRegistry.register('poti', {
    folder: 'elektronik',
    title: 'Potentiometer',
    defaultData: {},
    svg: `
        <svg viewBox="0 0 80 100" width="80" height="100" class="symbol">
            <!-- Hauptwiderstand -->
            <line x1="20" y1="10" x2="20" y2="30" stroke="black" stroke-width="2"/>
            <rect x="4" y="30" width="32" height="40" fill="none" stroke="black" stroke-width="2"/>
            <line x1="20" y1="70" x2="20" y2="90" stroke="black" stroke-width="2"/>
            <!-- Abgriff-Pfeil -->
            <line x1="55" y1="50" x2="38" y2="50" stroke="black" stroke-width="2"/>
            <polygon points="38,50 46,46 46,54" fill="black"/>
            <line x1="55" y1="35" x2="55" y2="65" stroke="black" stroke-width="2"/>
            <!-- Anschlüsse -->
            <circle cx="20" cy="10" r="4" fill="red" class="port"/>
            <circle cx="20" cy="90" r="4" fill="red" class="port"/>
            <circle cx="60" cy="50" r="4" fill="red" class="port"/>
            <!-- Beschriftungen -->
            <text x="63" y="53" font-size="9" font-family="Arial">M</text>
        </svg>
    `
});

// 8. Batterie / Spannungsquelle
window.ComponentRegistry.register('batterie', {
    folder: 'elektronik',
    title: 'Batterie',
    defaultData: {},
    svg: `
        <svg viewBox="0 0 60 100" width="60" height="100" class="symbol">
            <line x1="30" y1="10" x2="30" y2="38" stroke="black" stroke-width="2"/>
            <!-- Plus-Pol (lange Linie) -->
            <line x1="12" y1="38" x2="48" y2="38" stroke="black" stroke-width="3"/>
            <!-- Minus-Pol (kurze Linie) -->
            <line x1="18" y1="46" x2="42" y2="46" stroke="black" stroke-width="2"/>
            <!-- Plus-Pol 2 -->
            <line x1="12" y1="54" x2="48" y2="54" stroke="black" stroke-width="3"/>
            <!-- Minus-Pol 2 -->
            <line x1="18" y1="62" x2="42" y2="62" stroke="black" stroke-width="2"/>
            <line x1="30" y1="62" x2="30" y2="90" stroke="black" stroke-width="2"/>
            <!-- +/- Beschriftung -->
            <text x="50" y="42" font-size="10" font-family="Arial" font-weight="bold">+</text>
            <text x="50" y="58" font-size="10" font-family="Arial" font-weight="bold">+</text>
            <text x="2" y="50" font-size="10" font-family="Arial" font-weight="bold">−</text>
            <text x="2" y="66" font-size="10" font-family="Arial" font-weight="bold">−</text>
            <circle cx="30" cy="10" r="4" fill="red" class="port"/>
            <circle cx="30" cy="90" r="4" fill="red" class="port"/>
        </svg>
    `
});

// 8. Batterie / Spannungsquelle
window.ComponentRegistry.register('spannungsquelle_dc', {
    folder: 'elektronik',
    title: 'Spannungsquelle_dc',
    defaultData: {},
    svg: `
        <svg viewBox="0 0 60 100" width="60" height="100" class="symbol">
            <line x1="30" y1="10" x2="30" y2="42" stroke="black" stroke-width="2"/>
            <!-- Plus-Pol (lange Linie) -->
            <line x1="12" y1="42" x2="48" y2="42" stroke="black" stroke-width="3"/>
            <!-- Minus-Pol (kurze Linie) -->
            <line x1="18" y1="51" x2="42" y2="51" stroke="black" stroke-width="2"/>
            <!-- Anschluss -->
            <line x1="30" y1="51" x2="30" y2="90" stroke="black" stroke-width="2"/>
            <!-- +/- Beschriftung -->
            <text x="50" y="47" font-size="10" font-family="Arial" font-weight="bold">+</text>
            <text x="2" y="56" font-size="10" font-family="Arial" font-weight="bold">−</text>
            <circle cx="30" cy="10" r="4" fill="red" class="port"/>
            <circle cx="30" cy="90" r="4" fill="red" class="port"/>
        </svg>
    `
});

// 9. Kondensator (unpolar)
window.ComponentRegistry.register('kondensator', {
    folder: 'elektronik',
    title: 'Kondensator',
    defaultData: {},
    svg: `
        <svg viewBox="0 0 60 100" width="60" height="100" class="symbol">
            <line x1="30" y1="10" x2="30" y2="44" stroke="black" stroke-width="2"/>
            <!-- Platte 1 -->
            <line x1="8" y1="44" x2="52" y2="44" stroke="black" stroke-width="3"/>
            <!-- Platte 2 -->
            <line x1="8" y1="56" x2="52" y2="56" stroke="black" stroke-width="3"/>
            <line x1="30" y1="56" x2="30" y2="90" stroke="black" stroke-width="2"/>
            <circle cx="30" cy="10" r="4" fill="red" class="port"/>
            <circle cx="30" cy="90" r="4" fill="red" class="port"/>
        </svg>
    `
});

// 10. Spannungsmessgerät
window.ComponentRegistry.register('voltmeter', {
    folder: 'elektronik',
    title: 'Spannungsmessgerät',
    defaultData: {},
    svg: `
        <svg viewBox="0 0 60 100" width="60" height="100" class="symbol">
            <!-- Anschluss oben -->    
            <line x1="45" y1="10" x2="45" y2="37" stroke="black" stroke-width="2"/>
            <line x1="45" y1="10" x2="4" y2="10" stroke="black" stroke-width="2"/>
            <circle cx="4" cy="10" r="4" fill="red" class="port"/>
            <!-- Kreis mit "V" in der Mitte -->
            <circle cx="45" cy="50" r="14" fill="none" stroke="black" stroke-width="1.5"/>
            <text x="45" y="50" text-anchor="middle" dominant-baseline="central" font-size="20" font-family="Arial" fill="#000">V</text>
            <!-- Anschluss unten -->
            <line x1="45" y1="65" x2="45" y2="90" stroke="black" stroke-width="2"/>
            <line x1="45" y1="90" x2="4" y2="90" stroke="black" stroke-width="2"/>
            <circle cx="4" cy="90" r="4" fill="red" class="port"/>
        </svg>
    `
});