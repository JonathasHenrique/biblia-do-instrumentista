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
  const normTone = (tone || 'C').trim();
  const isFlatKey = ["F", "Bb", "Eb", "Ab", "Db", "Gb", "Dm", "Gm", "Cm", "Fm", "Bbm"].includes(normTone);
  const scale = isFlatKey ? CHROMATIC_FLAT : CHROMATIC_SCALE;

  let rootIndex = scale.indexOf(normTone);
  if (rootIndex === -1) rootIndex = (isFlatKey ? CHROMATIC_SCALE : CHROMATIC_FLAT).indexOf(normTone);
  if (rootIndex === -1) rootIndex = 0;

  const getNote = (step) => scale[(rootIndex + step) % 12];

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
    capoTips: getCapoTips(I),
    capoRec: getCapoRecommendation(I)
  };
}

// Recomendações didáticas e práticas de Capotraste para violonistas novatos
export function getCapoRecommendation(targetTone) {
  let norm = (targetTone || 'C').trim();
  if (norm === "A#") norm = "Bb";
  if (norm === "D#") norm = "Eb";
  if (norm === "G#") norm = "Ab";
  if (norm === "Db") norm = "C#";
  if (norm === "Gb") norm = "F#";

  const RECOMMENDATIONS = {
    "G": {
      needsCapo: false,
      tipText: "Tom natural aberto (o mais fácil para violão iniciante — sem pestanas: G, C, D, Em).",
      shape: null,
      fret: 0,
      transposeDiff: 0
    },
    "C": {
      needsCapo: false,
      tipText: "Tom natural aberto (C, G, Am). Novato com dificuldade na pestana de Fá? Use Capo na 5ª casa em [G].",
      shape: "G",
      fret: 5,
      transposeDiff: -5
    },
    "D": {
      needsCapo: false,
      tipText: "Tom natural aberto (acordes fáceis D, G, A. Bm na 2ª casa).",
      shape: null,
      fret: 0,
      transposeDiff: 0
    },
    "E": {
      needsCapo: false,
      tipText: "Tom natural aberto (acordes simples sem pestana: E, A, B7, Em).",
      shape: null,
      fret: 0,
      transposeDiff: 0
    },
    "A": {
      needsCapo: false,
      tipText: "Tom natural aberto (A, D, E). Dica: Para eliminar pestana de F#m, use Capo na 2ª casa com forma de [G].",
      shape: "G",
      fret: 2,
      transposeDiff: -2
    },
    "F": {
      needsCapo: true,
      tipText: "💡 Capo na 3ª casa com forma de [D] (ou Capo na 1ª casa em [E]) — elimina as pestanas de Fá!",
      shape: "D",
      fret: 3,
      transposeDiff: -3
    },
    "F#": {
      needsCapo: true,
      tipText: "💡 Capo na 2ª casa com forma de [E] (ou Capo na 4ª casa em [D]) — toque sem pestanas!",
      shape: "E",
      fret: 2,
      transposeDiff: -2
    },
    "Bb": {
      needsCapo: true,
      tipText: "💡 Capo na 3ª casa com forma de [G] — elimina todas as pestanas difíceis de Si Bemol!",
      shape: "G",
      fret: 3,
      transposeDiff: -3
    },
    "Eb": {
      needsCapo: true,
      tipText: "💡 Capo na 1ª casa com forma de [D] (ou Capo na 3ª casa em [C]) — acordes fáceis e abertos!",
      shape: "D",
      fret: 1,
      transposeDiff: -1
    },
    "Ab": {
      needsCapo: true,
      tipText: "💡 Capo na 1ª casa com forma de [G] — toque sem nenhuma pestana!",
      shape: "G",
      fret: 1,
      transposeDiff: -1
    },
    "B": {
      needsCapo: true,
      tipText: "💡 Capo na 4ª casa com forma de [G] (ou Capo na 2ª casa em [A]) — toque com acordes abertos!",
      shape: "G",
      fret: 4,
      transposeDiff: -4
    },
    "C#": {
      needsCapo: true,
      tipText: "💡 Capo na 1ª casa com forma de [C] — toque com acordes abertos fáceis!",
      shape: "C",
      fret: 1,
      transposeDiff: -1
    }
  };

  return RECOMMENDATIONS[norm] || {
    needsCapo: false,
    tipText: `Toque natural em ${targetTone}.`,
    shape: null,
    fret: 0,
    transposeDiff: 0
  };
}

export function getCapoTips(targetTone) {
  const rec = getCapoRecommendation(targetTone);
  return rec.tipText;
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
