// Dicionário de Acordes Interativo para Violão e Contrabaixo

export const GUITAR_CHORDS = {
  // Maiores
  "C":   { name: "Dó Maior", frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], baseFret: 1 },
  "D":   { name: "Ré Maior", frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], baseFret: 1 },
  "E":   { name: "Mi Maior", frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], baseFret: 1 },
  "F":   { name: "Fá Maior", frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], baseFret: 1, bar: true },
  "G":   { name: "Sol Maior", frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], baseFret: 1 },
  "A":   { name: "Lá Maior", frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], baseFret: 1 },
  "B":   { name: "Si Maior", frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], baseFret: 2, bar: true },

  // Menores
  "Cm":  { name: "Dó Menor", frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], baseFret: 3, bar: true },
  "Dm":  { name: "Ré Menor", frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], baseFret: 1 },
  "Em":  { name: "Mi Menor", frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], baseFret: 1 },
  "Fm":  { name: "Fá Menor", frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], baseFret: 1, bar: true },
  "Gm":  { name: "Sol Menor", frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], baseFret: 3, bar: true },
  "Am":  { name: "Lá Menor", frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], baseFret: 1 },
  "Bm":  { name: "Si Menor", frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], baseFret: 2, bar: true },

  // Com Sétima
  "C7":  { name: "Dó com Sétima", frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0], baseFret: 1 },
  "D7":  { name: "Ré com Sétima", frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3], baseFret: 1 },
  "E7":  { name: "Mi com Sétima", frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0], baseFret: 1 },
  "F7":  { name: "Fá com Sétima", frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], baseFret: 1, bar: true },
  "G7":  { name: "Sol com Sétima", frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1], baseFret: 1 },
  "A7":  { name: "Lá com Sétima", frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 2, 0], baseFret: 1 },
  "B7":  { name: "Si com Sétima", frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4], baseFret: 1 },

  // Sustenidos e Especiais
  "F#":  { name: "Fá Sustenido Maior", frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], baseFret: 2, bar: true },
  "F#m": { name: "Fá Sustenido Menor", frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], baseFret: 2, bar: true },
  "C#m": { name: "Dó Sustenido Menor", frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], baseFret: 4, bar: true },
  "G#m": { name: "Sol Sustenido Menor", frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], baseFret: 4, bar: true },
  "Bb":  { name: "Si Bemol Maior", frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], baseFret: 1, bar: true },
  "D#º": { name: "Ré Sustenido Diminuto", frets: [-1, -1, 1, 2, 1, 2], fingers: [0, 0, 1, 3, 2, 4], baseFret: 1 },
  "D#°": { name: "Ré Sustenido Diminuto", frets: [-1, -1, 1, 2, 1, 2], fingers: [0, 0, 1, 3, 2, 4], baseFret: 1 },
  "B7/9":{ name: "Si com Sétima e Nona", frets: [-1, 2, 1, 2, 2, -1], fingers: [0, 2, 1, 3, 4, 0], baseFret: 1 }
};

export const BASS_ARPEGGIOS = {
  "C":   { root: "C (3ª casa, 3ª corda A)", fifth: "G (5ª casa, 2ª corda D)", octave: "C (5ª casa, 1ª corda G)", third: "E (2ª casa, 2ª corda D)" },
  "D":   { root: "D (aberta corda D ou 5ª casa corda A)", fifth: "A (aberta corda A ou 7ª casa corda A)", octave: "D (7ª casa corda G)", third: "F# (4ª casa corda D)" },
  "E":   { root: "E (aberta corda E)", fifth: "B (2ª casa corda A)", octave: "E (2ª casa corda D)", third: "G# (4ª casa corda E)" },
  "F":   { root: "F (1ª casa corda E)", fifth: "C (3ª casa corda A)", octave: "F (3ª casa corda D)", third: "A (aberta corda A ou 5ª casa corda E)" },
  "F#":  { root: "F# (2ª casa corda E)", fifth: "C# (4ª casa corda A)", octave: "F# (4ª casa corda D)", third: "A# (1ª casa corda A)" },
  "G":   { root: "G (3ª casa corda E)", fifth: "D (5ª casa corda A ou aberta D)", octave: "G (5ª casa corda D)", third: "B (2ª casa corda A)" },
  "A":   { root: "A (aberta corda A)", fifth: "E (aberta corda E ou 2ª casa corda D)", octave: "A (2ª casa corda G)", third: "C# (4ª casa corda A)" },
  "B":   { root: "B (2ª casa corda A)", fifth: "F# (4ª casa corda D)", octave: "B (4ª casa corda G)", third: "D# (1ª casa corda D)" },
  "D#º": { root: "D# (6ª casa corda A)", fifth: "A (aberta corda A)", octave: "D# (6ª casa corda G)", third: "F# (2ª casa corda E)" },
  "B7/9":{ root: "B (2ª casa corda A)", fifth: "F# (4ª casa corda D)", octave: "B (4ª casa corda G)", third: "D# (1ª casa corda D)" }
};

export function renderGuitarChordSVG(chordKey) {
  const data = GUITAR_CHORDS[chordKey];
  if (!data) return null;

  const width = 160;
  const height = 180;
  const numStrings = 6;
  const numFrets = 5;
  const startX = 30;
  const startY = 35;
  const stringSpacing = 20;
  const fretSpacing = 26;

  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background:#131b2e; border-radius:12px; padding:6px; box-shadow:0 4px 15px rgba(0,0,0,0.4);">`;

  // Título do Acorde
  svg += `<text x="${width / 2}" y="20" fill="#f59e0b" font-family="sans-serif" font-weight="bold" font-size="16" text-anchor="middle">${chordKey}</text>`;

  // Nut (pestana superior grossa) se for casa 1
  if (data.baseFret === 1) {
    svg += `<line x1="${startX}" y1="${startY}" x2="${startX + (numStrings - 1) * stringSpacing}" y2="${startY}" stroke="#fbbf24" stroke-width="4"/>`;
  } else {
    svg += `<text x="${startX - 18}" y="${startY + 18}" fill="#94a3b8" font-family="sans-serif" font-size="11" font-weight="bold">${data.baseFret}ª</text>`;
  }

  // Trastes horizontais
  for (let f = 0; f <= numFrets; f++) {
    const y = startY + f * fretSpacing;
    svg += `<line x1="${startX}" y1="${y}" x2="${startX + (numStrings - 1) * stringSpacing}" y2="${y}" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>`;
  }

  // Cordas verticais
  for (let s = 0; s < numStrings; s++) {
    const x = startX + s * stringSpacing;
    svg += `<line x1="${x}" y1="${startY}" x2="${x}" y2="${startY + numFrets * fretSpacing}" stroke="rgba(255,255,255,0.4)" stroke-width="${s < 3 ? 1.5 : 1}"/>`;
  }

  // Bolinhas e Marcadores de Cordas
  data.frets.forEach((fret, sIdx) => {
    const x = startX + sIdx * stringSpacing;

    if (fret === -1) {
      // Corda abafada (X)
      svg += `<text x="${x}" y="${startY - 6}" fill="#ef4444" font-family="sans-serif" font-weight="bold" font-size="12" text-anchor="middle">✕</text>`;
    } else if (fret === 0) {
      // Corda solta (O)
      svg += `<circle cx="${x}" cy="${startY - 9}" r="4" fill="none" stroke="#10b981" stroke-width="1.8"/>`;
    } else {
      // Dedo no traste
      const fretRelative = fret - data.baseFret + 1;
      if (fretRelative >= 1 && fretRelative <= numFrets) {
        const y = startY + (fretRelative - 0.5) * fretSpacing;
        svg += `<circle cx="${x}" cy="${y}" r="7" fill="#f59e0b"/>`;
        if (data.fingers && data.fingers[sIdx]) {
          svg += `<text x="${x}" y="${y + 3.5}" fill="#000" font-family="sans-serif" font-weight="bold" font-size="10" text-anchor="middle">${data.fingers[sIdx]}</text>`;
        }
      }
    }
  });

  svg += `</svg>`;
  return svg;
}
