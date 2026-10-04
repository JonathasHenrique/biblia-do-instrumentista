// Mecanismo de Transposição de Cifras e Harmonia Musical

const NOTES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTES_FLAT  = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const CHORD_REGEX = /\b([A-G][b#]?)(?:m|maj|min|dim|aug|sus[24]?|[0-9]+|[º°+]|\/[0-9]+|\/[A-G][b#]?)*(?!\w)/g;

export function transposeChord(chord, semitones) {
  if (semitones === 0) return chord;

  return chord.replace(/([A-G][b#]?)/g, (match) => {
    let index = NOTES_SHARP.indexOf(match);
    if (index === -1) {
      index = NOTES_FLAT.indexOf(match);
    }
    if (index === -1) return match;

    let newIndex = (index + semitones) % 12;
    if (newIndex < 0) newIndex += 12;

    return NOTES_SHARP[newIndex];
  });
}

const CHORD_TOKEN_REGEX = /^[A-G][b#]?(?:m|maj|Maj|min|dim|aug|sus[24]?|[0-9]+|[º°+]|\/[0-9]+|\/[A-G][b#]?)*(?:\((?:add)?[0-9b#+-]+\))?$/;
const SYMBOL_TOKEN_REGEX = /^([|/\\%:()\-+]|[0-9]+x|\([0-9]+x\)|--+)$/;

export function isChordLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return false;
  if (/^\s*(?:INTROD|INTRO|SOLO|FINAL|PONTE)/i.test(trimmed)) return false;

  const tokens = trimmed.split(/\s+/);
  if (tokens.length === 0) return false;

  let chordCount = 0;
  for (const token of tokens) {
    const clean = token.replace(/^[([{\]]+|[)\]}]+$/g, '');
    if (CHORD_TOKEN_REGEX.test(clean)) {
      chordCount++;
    } else if (SYMBOL_TOKEN_REGEX.test(clean)) {
      // Símbolo musical
    } else {
      return false;
    }
  }
  return chordCount > 0;
}

export function transposeText(text, semitones) {
  if (semitones === 0) return text;

  const lines = text.split("\n");
  const processedLines = lines.map(line => {
    // Se for cabeçalho de tom
    if (line.startsWith("[Tom:")) {
      return line.replace(/\[Tom:\s*([A-G][b#]?)\]/i, (m, root) => {
        return `[Tom: ${transposeChord(root, semitones)}]`;
      });
    }

    // Se a linha for de introdução (ex: INTROD.: D A E A)
    if (/^\s*(?:INTROD\.?:?|INTRO:?|\[INTRODUÇÃO:?\]?)\s*/i.test(line)) {
      return line.replace(CHORD_REGEX, (chord) => transposeChord(chord, semitones));
    }

    // Se for linha de acordes pura
    if (isChordLine(line)) {
      return line.replace(CHORD_REGEX, (chord) => transposeChord(chord, semitones));
    }
    return line;
  });

  return processedLines.join("\n");
}
