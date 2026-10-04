// Mecanismo de Seleção Inteligente de Tons, Campo Harmônico e Dicas de Instrumento

export const ALL_TONES = [
  { name: "C",  label: "C (Dó)",      enharmonic: "C",  semitonesFromC: 0 },
  { name: "C#", label: "C# / Db",     enharmonic: "Db", semitonesFromC: 1 },
  { name: "D",  label: "D (Ré)",      enharmonic: "D",  semitonesFromC: 2 },
  { name: "Eb", label: "Eb / D#",     enharmonic: "D#", semitonesFromC: 3 },
  { name: "E",  label: "E (Mi)",      enharmonic: "E",  semitonesFromC: 4 },
  { name: "F",  label: "F (Fá)",      enharmonic: "F",  semitonesFromC: 5 },
  { name: "F#", label: "F# / Gb",     enharmonic: "Gb", semitonesFromC: 6 },
  { name: "G",  label: "G (Sol)",     enharmonic: "G",  semitonesFromC: 7 },
  { name: "Ab", label: "Ab / G#",     enharmonic: "G#", semitonesFromC: 8 },
  { name: "A",  label: "A (Lá)",      enharmonic: "A",  semitonesFromC: 9 },
  { name: "Bb", label: "Bb / A#",     enharmonic: "A#", semitonesFromC: 10 },
  { name: "B",  label: "B (Si)",      enharmonic: "B",  semitonesFromC: 11 }
];

const CHROMATIC_SCALE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const CHROMATIC_FLAT  = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

// Calcula os acordes do Campo Harmônico Maior (I, ii, iii, IV, V, vi, vii°)
export function getHarmonicField(tone) {
  let rootIndex = CHROMATIC_SCALE.indexOf(tone);
  if (rootIndex === -1) rootIndex = CHROMATIC_FLAT.indexOf(tone);
  if (rootIndex === -1) rootIndex = 0;

  const getNote = (step) => CHROMATIC_SCALE[(rootIndex + step) % 12];

  const I   = getNote(0);
  const ii  = getNote(2) + "m";
  const iii = getNote(4) + "m";
  const IV  = getNote(5);
  const V   = getNote(7);
  const V7  = getNote(7) + "7";
  const vi  = getNote(9) + "m"; // Relativa Menor

  return {
    root: I,
    I,
    ii,
    iii,
    IV,
    V,
    V7,
    vi,
    relativeMinor: vi,
    capoTips: getCapoTips(I)
  };
}

// Sugestões práticas de Capotraste para violonistas
function getCapoTips(targetTone) {
  const easyShapes = [
    { shape: "C", index: 0 },
    { shape: "D", index: 2 },
    { shape: "E", index: 4 },
    { shape: "G", index: 7 },
    { shape: "A", index: 9 }
  ];

  let targetIndex = CHROMATIC_SCALE.indexOf(targetTone);
  if (targetIndex === -1) targetIndex = CHROMATIC_FLAT.indexOf(targetTone);
  if (targetIndex === -1) return null;

  for (const s of easyShapes) {
    let diff = targetIndex - s.index;
    if (diff < 0) diff += 12;
    if (diff >= 1 && diff <= 5) {
      return `Toque com forma de [${s.shape}] e Capo na ${diff}ª casa.`;
    }
  }
  return `Sem necessidade de Capotraste (toque natural em ${targetTone}).`;
}

// Calcula a diferença em semitons entre o tom base e o tom desejado
export function calculateSemitones(baseTone, targetTone) {
  let idxBase = CHROMATIC_SCALE.indexOf(baseTone);
  if (idxBase === -1) idxBase = CHROMATIC_FLAT.indexOf(baseTone);

  let idxTarget = CHROMATIC_SCALE.indexOf(targetTone);
  if (idxTarget === -1) idxTarget = CHROMATIC_FLAT.indexOf(targetTone);

  if (idxBase === -1 || idxTarget === -1) return 0;

  let diff = idxTarget - idxBase;
  // Ajustar para o caminho mais curto (-6 a +6 semitons)
  if (diff > 6) diff -= 12;
  if (diff < -6) diff += 12;
  return diff;
}
