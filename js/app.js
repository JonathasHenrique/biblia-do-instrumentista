// Orquestrador Principal do Aplicativo "Bíblia do Instrumentista"
// Suporte Integral: Bíblia Sagrada ACF Completa, Harpa Cristã com Partituras Interativas (ABCJS),
// Seletor Funcional de Tons, Campo Harmônico, Dicionário de Acordes, Afinador e Metrônomo.

import { TunerEngine } from './tuner.js';
import { MetronomeEngine } from './metronome.js';
import { harpaHymns } from '../data/harpaData.js';
import { bibleBooks as defaultBooks, acfTexts, devocionaisInstrumentista } from '../data/bibliaData.js';
import { transposeText, transposeChord, isChordLine } from './transposer.js';
import { GUITAR_CHORDS, BASS_ARPEGGIOS, renderGuitarChordSVG } from './chords.js';
import { ALL_TONES, getHarmonicField, calculateSemitones } from './toneSelector.js';
import { HYMN_CATALOG } from '../data/hymnCatalog.js';

class App {
  constructor() {
    this.currentTab = 'tuner';
    this.fullBibleData = null;
    this.fullHarpaData = null;
    this.bibleVersions = { acf: null, arc: null, tb: null };
    this.currentBibleVersion = 'acf';
    this.hymnsList = [...harpaHymns];
    this.selectedHymn = harpaHymns[0];
    this.hymnTranspose = 0;
    const urlParams = new URLSearchParams(window.location.search);
    const themeParam = urlParams.get('theme');
    const chordsParam = urlParams.get('chords');

    this.showChords = chordsParam === 'off' ? false : (localStorage.getItem('bi_chords') !== 'off');
    this.currentTheme = themeParam || localStorage.getItem('bi_theme') || 'dark';
    this.autoScrollInterval = null;
    this.fontSize = 16;
    this.favorites = JSON.parse(localStorage.getItem('bi_favorites') || '[]');

    this.applyTheme(this.currentTheme);
    this.initThemeToggle();
    this.initTuner();
    this.initHarpa();
    this.initBiblia();
    this.initMetronome();
    this.initNavigation();
    this.initChordsModal();

    if (urlParams.get('modal') === 'chords') {
      this.showChordModal(urlParams.get('chord') || 'D');
    }

    this.loadFullBibleAsync();
    this.loadFullHarpaAsync();
  }

  // --------------------------------------------------------------------------
  // Navegação por Abas
  // --------------------------------------------------------------------------
  initNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        tabButtons.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetPane = document.getElementById(`pane-${tab}`);
        if (targetPane) targetPane.classList.add('active');
        this.currentTab = tab;
      });
    });

    // Ativar aba via hash da URL se fornecido
    let hash = window.location.hash.replace('#', '');
    if (hash === 'metronome') hash = 'metronomo';
    if (hash && ['tuner', 'harpa', 'biblia', 'metronomo'].includes(hash)) {
      const targetBtn = document.querySelector(`[data-tab="${hash}"]`);
      if (targetBtn) targetBtn.click();
    }
  }

  // --------------------------------------------------------------------------
  // ALTERNADOR DE TEMA (MODO ESCURO / MODO CLARO)
  // --------------------------------------------------------------------------
  initThemeToggle() {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
      this.applyTheme(this.currentTheme);
      localStorage.setItem('bi_theme', this.currentTheme);
    });
  }

  applyTheme(theme) {
    const icon = document.getElementById('theme-toggle-icon');
    const label = document.getElementById('theme-toggle-label');

    if (theme === 'light') {
      document.body.classList.add('light-theme');
      if (icon) icon.textContent = '🌙';
      if (label) label.textContent = 'Escuro';
    } else {
      document.body.classList.remove('light-theme');
      if (icon) icon.textContent = '☀️';
      if (label) label.textContent = 'Claro';
    }
  }

  // --------------------------------------------------------------------------
  // AFINADOR
  // --------------------------------------------------------------------------
  initTuner() {
    const micBtn = document.getElementById('mic-toggle');
    const instrumentSelect = document.getElementById('instrument-select');
    const tuningSelect = document.getElementById('tuning-select');
    const a4Select = document.getElementById('a4-select');
    const needle = document.getElementById('gauge-needle');
    const noteEl = document.getElementById('detected-note');
    const octaveEl = document.getElementById('detected-octave');
    const centsEl = document.getElementById('detected-cents');
    const hzEl = document.getElementById('detected-hz');
    const tunerCard = document.querySelector('.tuner-card');

    this.tuner = new TunerEngine(
      (data) => {
        if (!data.hasSignal || data.frequency === 0) {
          needle.style.transform = `rotate(0deg)`;
          needle.classList.remove('needle-tuned');
          noteEl.classList.remove('tuned-text');
          tunerCard.classList.remove('tuned');
          centsEl.className = 'cents-readout';
          centsEl.textContent = '-- cents';
          hzEl.textContent = 'Toque uma corda...';
          return;
        }

        noteEl.textContent = data.note;
        octaveEl.textContent = data.octave;

        const angle = (data.cents / 50) * 60;
        needle.style.transform = `rotate(${angle}deg)`;

        hzEl.textContent = `${data.frequency.toFixed(1)} Hz (Alvo: ${data.targetFreq.toFixed(1)} Hz)`;
        centsEl.textContent = `${data.cents > 0 ? '+' : ''}${data.cents} cents`;

        if (data.isTuned) {
          needle.classList.add('needle-tuned');
          noteEl.classList.add('tuned-text');
          tunerCard.classList.add('tuned');
          centsEl.className = 'cents-readout cents-ok';
          centsEl.textContent = '✓ AFINADO';
        } else {
          needle.classList.remove('needle-tuned');
          noteEl.classList.remove('tuned-text');
          tunerCard.classList.remove('tuned');
          centsEl.className = 'cents-readout';
        }

        if (data.closestString) {
          document.querySelectorAll('.string-peg').forEach(peg => {
            if (peg.dataset.note === data.closestString.note && parseInt(peg.dataset.octave) === data.closestString.octave) {
              peg.classList.add(data.isTuned ? 'tuned-target' : 'active-target');
            } else {
              peg.classList.remove('active-target', 'tuned-target');
            }
          });
        }
      },
      (isRunning, error) => {
        if (isRunning) {
          micBtn.classList.add('running');
          micBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
            Desativar Microfone
          `;
        } else {
          micBtn.classList.remove('running');
          micBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            Ativar Afinador
          `;
          if (error) alert(`Não foi possível acessar o microfone: ${error}`);
        }
      }
    );

    micBtn.addEventListener('click', () => {
      if (this.tuner.isRunning) {
        this.tuner.stop();
      } else {
        this.tuner.start();
      }
    });

    const renderTuningOptions = () => {
      const instKey = instrumentSelect.value;
      this.tuner.currentInstrument = instKey;
      const instData = this.tuner.instrumentPresets[instKey];

      tuningSelect.innerHTML = '';
      Object.entries(instData.tunings).forEach(([key, val]) => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = val.name;
        tuningSelect.appendChild(opt);
      });
      this.tuner.currentTuning = tuningSelect.value;
      this.renderStringPegs();
    };

    instrumentSelect.addEventListener('change', renderTuningOptions);
    tuningSelect.addEventListener('change', () => {
      this.tuner.currentTuning = tuningSelect.value;
      this.renderStringPegs();
    });

    if (a4Select) {
      a4Select.addEventListener('change', (e) => {
        this.tuner.setA4(e.target.value);
      });
    }

    renderTuningOptions();
  }

  renderStringPegs() {
    const container = document.getElementById('strings-container');
    container.innerHTML = '';
    const strings = this.tuner.getStrings();

    if (strings.length === 0) {
      container.innerHTML = `<span style="color:#64748b; font-size:0.85rem;">Modo cromático ativo: afinando qualquer nota automaticamente.</span>`;
      return;
    }

    strings.forEach((str) => {
      const peg = document.createElement('div');
      peg.className = 'string-peg';
      peg.dataset.note = str.note;
      peg.dataset.octave = str.octave;

      peg.innerHTML = `
        <span class="peg-note">${str.note}${str.octave}</span>
        <span class="peg-name">${str.name}</span>
        <span class="peg-freq">${str.freq.toFixed(1)} Hz</span>
        <svg class="play-sound-icon" viewBox="0 0 24 24">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      `;

      peg.addEventListener('click', () => {
        this.tuner.playTone(str.freq, 2.5);
        peg.classList.add('active-target');
        setTimeout(() => peg.classList.remove('active-target'), 1500);
      });

      container.appendChild(peg);
    });
  }

  // --------------------------------------------------------------------------
  // HARPA CRISTÃ: SELEÇÃO DE TONS, CAMPO HARMÔNICO & PARTITURA INTERATIVA
  // --------------------------------------------------------------------------
  initHarpa() {
    const searchInput = document.getElementById('hymn-search');
    const btnTransposeUp = document.getElementById('btn-transpose-up');
    const btnTransposeDown = document.getElementById('btn-transpose-down');
    const btnTransposeReset = document.getElementById('btn-transpose-reset');
    const btnAutoScroll = document.getElementById('btn-autoscroll');
    const btnFontPlus = document.getElementById('btn-font-plus');
    const btnFontMinus = document.getElementById('btn-font-minus');
    const chordSheet = document.getElementById('chord-sheet-content');

    // Alternador de Cifras (Ligar / Desligar Cifras para modo Só Letra / Cantar)
    const toggleChordsBtn = document.getElementById('btn-toggle-chords');
    const toggleChordsIcon = document.getElementById('toggle-chords-icon');
    const toggleChordsLabel = document.getElementById('toggle-chords-label');

    this.updateChordsVisibility = () => {
      const container = document.getElementById('lyrics-chords-body');
      if (!container) return;

      if (this.showChords) {
        container.classList.remove('lyrics-only-mode');
        if (toggleChordsBtn) {
          toggleChordsBtn.classList.add('active');
          if (toggleChordsIcon) toggleChordsIcon.textContent = '🎸';
          if (toggleChordsLabel) toggleChordsLabel.textContent = 'Cifras: Ativas';
          toggleChordsBtn.title = 'Clique para ocultar as cifras e deixar apenas a letra para cantar';
        }
      } else {
        container.classList.add('lyrics-only-mode');
        if (toggleChordsBtn) {
          toggleChordsBtn.classList.remove('active');
          if (toggleChordsIcon) toggleChordsIcon.textContent = '🎤';
          if (toggleChordsLabel) toggleChordsLabel.textContent = 'Só Letra';
          toggleChordsBtn.title = 'Clique para reativar as cifras';
        }
      }
      localStorage.setItem('bi_chords', this.showChords ? 'on' : 'off');
    };

    if (toggleChordsBtn) {
      toggleChordsBtn.addEventListener('click', () => {
        this.showChords = !this.showChords;
        this.updateChordsVisibility();
      });
    }

    // Barra de Tons Diretos
    this.renderToneButtons();

    searchInput.addEventListener('input', (e) => this.renderHymnList(e.target.value));

    // Ajuste Fino (+1 / -1 Semitom)
    btnTransposeUp.addEventListener('click', () => {
      this.hymnTranspose += 1;
      this.renderHymnContent();
    });
    btnTransposeDown.addEventListener('click', () => {
      this.hymnTranspose -= 1;
      this.renderHymnContent();
    });
    btnTransposeReset.addEventListener('click', () => {
      this.hymnTranspose = 0;
      this.renderHymnContent();
    });

    btnAutoScroll.addEventListener('click', () => {
      if (this.autoScrollInterval) {
        clearInterval(this.autoScrollInterval);
        this.autoScrollInterval = null;
        btnAutoScroll.classList.remove('active');
        btnAutoScroll.innerHTML = `▶ Rolagem Automática`;
      } else {
        btnAutoScroll.classList.add('active');
        btnAutoScroll.innerHTML = `⏸ Parar Rolagem`;
        this.autoScrollInterval = setInterval(() => {
          chordSheet.scrollTop += 1;
        }, 50);
      }
    });

    btnFontPlus.addEventListener('click', () => {
      if (this.fontSize < 24) {
        this.fontSize += 1;
        chordSheet.style.fontSize = `${this.fontSize}px`;
      }
    });
    btnFontMinus.addEventListener('click', () => {
      if (this.fontSize > 12) {
        this.fontSize -= 1;
        chordSheet.style.fontSize = `${this.fontSize}px`;
      }
    });

    // Abrir diagrama do acorde ao clicar em qualquer cifra no hino
    chordSheet.addEventListener('click', (e) => {
      const token = e.target.closest('.chord-token');
      if (token && token.dataset.chord) {
        this.showChordModal(token.dataset.chord);
      }
    });

    this.renderHymnList();
    this.renderHymnContent();
  }

  // Gera botões diretos para os 12 tons musicais
  renderToneButtons() {
    const container = document.getElementById('tone-buttons-container');
    container.innerHTML = '';

    ALL_TONES.forEach(tone => {
      const btn = document.createElement('button');
      btn.className = 'tone-btn';
      btn.textContent = tone.name;
      btn.dataset.tone = tone.name;
      btn.title = `Mudar tom diretamente para ${tone.label}`;

      btn.addEventListener('click', () => {
        const baseTone = this.selectedHymn ? (this.selectedHymn.tone || 'C') : 'C';
        this.hymnTranspose = calculateSemitones(baseTone, tone.name);
        this.renderHymnContent();
      });

      container.appendChild(btn);
    });
  }

  async loadFullHarpaAsync() {
    try {
      const resp = await fetch('./data/harpa_crista_640.json');
      if (!resp.ok) return;
      const data = await resp.json();
      this.fullHarpaData = data;

      const fullList = [];
      const curatedMap = new Map(harpaHymns.map(h => [h.number, h]));

      // Função de harmonização rítmica linha a linha com cadências completas (I - IV - V7 - vi)
      const harmonizeLines = (lines, tone, isCoro = false) => {
        const hf = getHarmonicField(tone);
        const I = hf.I || 'G';
        const IV = hf.IV || 'C';
        const V = (hf.V7 || 'D7').replace(/7$/, '') || I;
        const V7 = hf.V7 || 'D7';
        const vi = hf.vi || 'Em';

        let res = '';
        lines.forEach((lineText, idx) => {
          let chordLine = '';
          const pos = idx % 4;
          if (!isCoro) {
            if (pos === 0) {
              chordLine = `${I.padEnd(20)}${V}`;
            } else if (pos === 1) {
              chordLine = `${V7.padEnd(20)}${I}`;
            } else if (pos === 2) {
              chordLine = `${IV.padEnd(20)}${vi}`;
            } else {
              chordLine = `${IV.padEnd(8)}${V7.padEnd(10)}${I}`;
            }
          } else {
            if (pos === 0) {
              chordLine = `${I.padEnd(20)}${IV}`;
            } else if (pos === 1) {
              chordLine = `${I.padEnd(20)}${V7}`;
            } else if (pos === 2) {
              chordLine = `${I.padEnd(20)}${IV}`;
            } else {
              chordLine = `${I.padEnd(8)}${V7.padEnd(10)}${I}`;
            }
          }
          res += `${chordLine}\n${lineText}\n`;
        });
        return res;
      };

      for (let i = 1; i <= 640; i++) {
        const key = String(i);
        if (curatedMap.has(i)) {
          fullList.push(curatedMap.get(i));
        } else if (data[key]) {
          const raw = data[key];
          const cat = HYMN_CATALOG[i] || { tone: "G", rhythm: "Marcha (4/4)", meter: "4/4", intro: "G C G D7 G" };
          const tone = cat.tone;
          const rhythm = cat.rhythm;
          const intro = cat.intro;

          let formattedLyrics = `[Tom: ${tone}]\n\nINTROD.: ${intro}\n\n`;
          const rawCoro = raw.coro ? raw.coro.replace(/\s*Autor:.*$/i, '').trim() : '';
          const coroLines = rawCoro ? rawCoro.split(/<br\s*\/?>/gi).map(l => l.trim()).filter(Boolean) : [];

          const verses = raw.verses || {};
          const verseKeys = Object.keys(verses).sort((a, b) => {
            const na = parseInt(a, 10);
            const nb = parseInt(b, 10);
            return (!isNaN(na) && !isNaN(nb)) ? na - nb : a.localeCompare(b);
          });

          // Ordem cantada congregacional oficial: 1ª Estrofe -> Refrão -> 2ª Estrofe -> 3ª Estrofe...
          verseKeys.forEach((vNum, idx) => {
            const vText = (verses[vNum] || '').replace(/\s*Autor:.*$/i, '').trim();
            const vLines = vText.split(/<br\s*\/?>/gi).map(l => l.trim()).filter(Boolean);
            const label = isNaN(vNum) ? `[Estrofe ${vNum}]` : `[${vNum}ª Estrofe]`;
            formattedLyrics += `${label}\n${harmonizeLines(vLines, tone, false)}\n`;

            if (idx === 0 && coroLines.length > 0) {
              formattedLyrics += `[Refrão]\n${harmonizeLines(coroLines, tone, true)}\n`;
            }
          });

          // Caso raro de hino composto apenas de coro
          if (verseKeys.length === 0 && coroLines.length > 0) {
            formattedLyrics += `[Refrão]\n${harmonizeLines(coroLines, tone, true)}\n`;
          }

          const rawTitle = raw.hino || `Hino ${i}`;
          const cleanTitle = rawTitle.replace(/^\d+\s*-\s*/, '').trim();

          fullList.push({
            number: i,
            title: cleanTitle,
            author: "Harpa Cristã Oficial (CPAD)",
            tone: tone,
            rhythm: rhythm,
            intro: intro,
            lyrics: formattedLyrics.trim()
          });
        }
      }

      this.hymnsList = fullList;
      this.renderHymnList();
    } catch (e) {
      console.warn("Harpa completa carregada via conjunto curado básico:", e);
    }
  }

  renderHymnList(filter = '') {
    const hymnListContainer = document.getElementById('hymn-list');
    hymnListContainer.innerHTML = '';
    const term = filter.toLowerCase().trim();

    const filtered = this.hymnsList.filter(h => {
      return (
        h.number.toString().includes(term) ||
        h.title.toLowerCase().includes(term) ||
        (h.lyrics && h.lyrics.toLowerCase().includes(term))
      );
    });

    if (filtered.length === 0) {
      hymnListContainer.innerHTML = `<div style="padding:1rem;color:#64748b;">Nenhum hino encontrado.</div>`;
      return;
    }

    filtered.forEach(h => {
      const item = document.createElement('div');
      item.className = `hymn-item ${this.selectedHymn && this.selectedHymn.number === h.number ? 'active' : ''}`;
      item.innerHTML = `
        <div class="hymn-meta">
          <span class="hymn-num">Nº ${h.number}</span>
          <span class="hymn-title">${h.title}</span>
        </div>
        <span class="hymn-badge">${h.tone}</span>
      `;
      item.addEventListener('click', () => {
        this.selectedHymn = h;
        this.hymnTranspose = 0;
        document.querySelectorAll('.hymn-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.renderHymnContent();
      });
      hymnListContainer.appendChild(item);
    });
  }

  renderHymnContent() {
    const lyricsBody = document.getElementById('lyrics-chords-body');
    const toneBadge = document.getElementById('current-tone-badge');
    const harmonicFieldEl = document.getElementById('harmonic-field-display');

    if (!this.selectedHymn) return;

    // Calcular tom efetivo
    const baseTone = this.selectedHymn.tone || 'C';
    const effectiveTone = transposeChord(baseTone, this.hymnTranspose);

    // Atualizar badge do tom
    const toneDiff = this.hymnTranspose;
    const tonePrefix = toneDiff > 0 ? `+${toneDiff}` : toneDiff < 0 ? `${toneDiff}` : '';
    toneBadge.textContent = `Tom: ${effectiveTone} ${tonePrefix ? `(${tonePrefix})` : '(Orig)'}`;

    // Atualizar botões de tom ativos
    document.querySelectorAll('.tone-btn').forEach(btn => {
      if (btn.dataset.tone === effectiveTone) {
        btn.classList.add('active-tone');
      } else {
        btn.classList.remove('active-tone');
      }
    });

    // Exibir Campo Harmônico do Tom Atual & Dicas
    const hf = getHarmonicField(effectiveTone);
    harmonicFieldEl.innerHTML = `
      <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; align-items:center;">
        <div>
          <strong style="color:var(--gold-light);">Campo Harmônico (${effectiveTone}):</strong>
          I: <span style="color:#fff;font-weight:700;">${hf.I}</span> | 
          ii: <span>${hf.ii}</span> | 
          iii: <span>${hf.iii}</span> | 
          IV: <span style="color:#fff;font-weight:700;">${hf.IV}</span> | 
          V: <span style="color:#fff;font-weight:700;">${hf.V7}</span> | 
          vi: <span style="color:#fbbf24;">${hf.vi} (Relativa)</span>
        </div>
        <div style="color:#38bdf8; font-size:0.75rem;">
          💡 Capo: ${hf.capoTips}
        </div>
      </div>
    `;

    // Processamento linha a linha à prova de falhas:
    // Separa rigorosamente linhas de acordes de linhas de letra cantada.
    // Palavras com acentos ("Dá-nos", "Dá-lhes"), conjunções ("E", "A") e preposições ("Em")
    // NUNCA são tratadas como cifras.
    const CHORD_MATCH_REGEX = /\b([A-G][b#]?(?:m|maj|Maj|min|dim|aug|sus[24]?|[0-9]+|[º°+]|\/[0-9]+|\/[A-G][b#]?)*(?:\((?:add)?[0-9b#+-]+\))?)/g;

    const rawLyrics = this.selectedHymn.lyrics || '';
    const rawLines = rawLyrics.split(/\r?\n/);
    const htmlLines = [];
    let hasRenderedIntro = false;

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      const trimmed = line.trim();

      // Linha vazia -> espaçador suave entre estrofes
      if (!trimmed) {
        if (htmlLines.length > 0 && htmlLines[htmlLines.length - 1] !== '<div class="sheet-gap"></div>') {
          htmlLines.push('<div class="sheet-gap"></div>');
        }
        continue;
      }

      // Linha de tom explicito [Tom: X] -> Ignorada aqui pois já está no badge do topo
      if (/^\[Tom:\s*[A-G][b#]?\]$/i.test(trimmed)) {
        continue;
      }

      // Linha de Introdução
      if (/^\s*(?:INTROD\.?:?|INTRO:?|\[INTRODUÇÃO:?\]?)/i.test(trimmed)) {
        const introChordsPart = trimmed.replace(/^\s*(?:INTROD\.?:?|INTRO:?|\[INTRODUÇÃO:?\]?)\s*/i, '');
        const transposedIntroChords = introChordsPart.replace(CHORD_MATCH_REGEX, (c) => {
          const trans = this.hymnTranspose !== 0 ? transposeChord(c, this.hymnTranspose) : c;
          return `<strong class="chord-token" data-chord="${trans}" title="Clique para ver o acorde">${trans}</strong>`;
        });
        htmlLines.push(`<div class="intro-banner">🎵 <strong>INTRODUÇÃO:</strong> ${transposedIntroChords}</div>`);
        hasRenderedIntro = true;
        continue;
      }

      // Linha de Seção / Estrofe / Refrão: [1ª Estrofe], [Refrão], [Coro]
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        const sectionTitle = trimmed.slice(1, -1);
        htmlLines.push(`<div class="section-tag">${sectionTitle}</div>`);
        continue;
      }

      // Linha pura de acordes (cifras)
      if (isChordLine(line)) {
        // Transpõe se necessário e destaca acordes preservando os espaços originais de alinhamento
        const formattedChordLine = line.replace(CHORD_MATCH_REGEX, (chord) => {
          const trans = this.hymnTranspose !== 0 ? transposeChord(chord, this.hymnTranspose) : chord;
          return `<strong class="chord-token" data-chord="${trans}" title="Clique para ver o acorde">${trans}</strong>`;
        });
        htmlLines.push(`<div class="chord-line">${formattedChordLine}</div>`);
        continue;
      }

      // Linha de letra cantada:
      // NUNCA passa por substituição de acordes! Palavras como "Dá-nos", "E ricas", "Em" permanecem texto puro de letra.
      const safeLyric = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      htmlLines.push(`<div class="lyric-line">${safeLyric}</div>`);
    }

    // Se o hino tiver introdução catalogada mas não nas linhas, insere banner no topo
    let introTopBanner = '';
    if (!hasRenderedIntro && this.selectedHymn.intro) {
      const transposedCatalogIntro = this.selectedHymn.intro.replace(CHORD_MATCH_REGEX, (c) => {
        const trans = this.hymnTranspose !== 0 ? transposeChord(c, this.hymnTranspose) : c;
        return `<strong class="chord-token" data-chord="${trans}" title="Clique para ver o acorde">${trans}</strong>`;
      });
      introTopBanner = `<div class="intro-banner">🎵 <strong>INTRODUÇÃO:</strong> ${transposedCatalogIntro}</div>`;
    }

    lyricsBody.innerHTML = `
      <div class="chord-sheet-header">
        <h2>${this.selectedHymn.number}. ${this.selectedHymn.title}</h2>
        <p>Ritmo: ${this.selectedHymn.rhythm || 'Padrão'} | Tom Original: ${this.selectedHymn.tone} | Arranjo: ${this.selectedHymn.author}</p>
        ${introTopBanner}
      </div>
      <div class="hymn-sheet-body">
        ${htmlLines.join('')}
      </div>
    `;

    // Aplicar estado de visibilidade de cifras (Cifras Ligadas vs Só Letra)
    if (this.updateChordsVisibility) {
      this.updateChordsVisibility();
    }
  }

  // --------------------------------------------------------------------------
  // BÍBLIA SAGRADA ACF (COMPLETA - TODOS OS 66 LIVROS & TODOS OS SALMOS)
  // --------------------------------------------------------------------------
  initBiblia() {
    const bookSelect = document.getElementById('bible-book-select');
    const chapterSelect = document.getElementById('bible-chapter-select');
    const searchInput = document.getElementById('bible-search-input');
    const searchResults = document.getElementById('bible-search-results');

    const populateDefaultBooks = () => {
      bookSelect.innerHTML = '';
      let currentGroup = '';
      let optgroup = null;

      defaultBooks.forEach(book => {
        if (book.group !== currentGroup) {
          currentGroup = book.group;
          optgroup = document.createElement('optgroup');
          optgroup.label = currentGroup;
          bookSelect.appendChild(optgroup);
        }
        const opt = document.createElement('option');
        opt.value = book.id;
        opt.textContent = book.name;
        optgroup.appendChild(opt);
      });
    };

    populateDefaultBooks();

    const updateChapters = () => {
      const selectedId = bookSelect.value;
      chapterSelect.innerHTML = '';

      let maxChapters = 1;
      if (this.fullBibleData) {
        const bookData = this.fullBibleData.find(b => b.abbrev === selectedId || b.name.toLowerCase() === bookSelect.options[bookSelect.selectedIndex].text.toLowerCase());
        if (bookData) maxChapters = bookData.chapters.length;
      } else {
        const defaultBook = defaultBooks.find(b => b.id === selectedId);
        if (defaultBook) maxChapters = defaultBook.chapters;
      }

      for (let c = 1; c <= maxChapters; c++) {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = `Capítulo ${c}`;
        chapterSelect.appendChild(opt);
      }
      this.displayBibleChapter();
    };

    bookSelect.addEventListener('change', updateChapters);
    chapterSelect.addEventListener('change', () => this.displayBibleChapter());

    bookSelect.value = 'sl';
    updateChapters();
    chapterSelect.value = '150';
    this.displayBibleChapter();

    const versionSelect = document.getElementById('bible-version-select');
    if (versionSelect) {
      versionSelect.addEventListener('change', (e) => {
        this.switchBibleVersion(e.target.value);
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (query.length < 3) {
          searchResults.style.display = 'none';
          searchResults.innerHTML = '';
          return;
        }
        this.searchBible(query);
      });
    }

    this.renderDevotional();
  }

  async switchBibleVersion(version) {
    this.currentBibleVersion = version;
    const badge = document.getElementById('bible-active-version-badge');
    const labels = {
      acf: "Almeida Corrigida Fiel (ACF)",
      arc: "Almeida Revista e Corrigida (ARC - Clássica da Harpa)",
      tb: "Tradução Brasileira (TB - 1917 • Domínio Público)"
    };
    if (badge) badge.textContent = labels[version] || version.toUpperCase();

    // Se já estiver na memória
    if (this.bibleVersions[version]) {
      this.fullBibleData = this.bibleVersions[version];
      this.displayBibleChapter();
      return;
    }

    // Carregar arquivo da versão escolhida
    try {
      const fileName = version === 'acf' ? 'biblia_acf_completa.json' : `biblia_${version}.json`;
      const resp = await fetch(`./data/${fileName}`);
      if (resp.ok) {
        const data = await resp.json();
        this.bibleVersions[version] = data;
        this.fullBibleData = data;
        this.displayBibleChapter();
      }
    } catch (err) {
      console.warn(`Erro ao alternar para versão ${version}:`, err);
    }
  }

  async loadFullBibleAsync() {
    try {
      const resp = await fetch('./data/biblia_acf_completa.json');
      if (!resp.ok) return;
      const data = await resp.json();
      this.bibleVersions['acf'] = data;
      this.fullBibleData = data;

      const bookSelect = document.getElementById('bible-book-select');
      const currentSelected = bookSelect.value;
      bookSelect.innerHTML = '';

      let currentGroup = 'Antigo Testamento';
      let optgroup = document.createElement('optgroup');
      optgroup.label = currentGroup;
      bookSelect.appendChild(optgroup);

      data.forEach((book, idx) => {
        if (idx === 39) {
          currentGroup = 'Novo Testamento';
          optgroup = document.createElement('optgroup');
          optgroup.label = currentGroup;
          bookSelect.appendChild(optgroup);
        }
        const opt = document.createElement('option');
        opt.value = book.abbrev;
        opt.textContent = book.name;
        optgroup.appendChild(opt);
      });

      bookSelect.value = currentSelected || 'sl';
      const event = new Event('change');
      bookSelect.dispatchEvent(event);
    } catch (e) {
      console.warn("Usando conjunto base de textos bíblicos:", e);
    }
  }

  displayBibleChapter() {
    const bookSelect = document.getElementById('bible-book-select');
    const chapterSelect = document.getElementById('bible-chapter-select');
    const readerTitle = document.getElementById('bible-chapter-title');
    const readerSubtitle = document.getElementById('bible-chapter-subtitle');
    const textContainer = document.getElementById('bible-text-content');

    const bookAbbrev = bookSelect.value;
    const bookName = bookSelect.options[bookSelect.selectedIndex]?.text || 'Salmos';
    const chapter = parseInt(chapterSelect.value, 10) || 1;

    readerTitle.textContent = `${bookName} ${chapter}`;
    readerSubtitle.textContent = 'Almeida Corrigida Fiel (ACF) • Texto Sagrado Integral';

    if (this.fullBibleData) {
      const bookObj = this.fullBibleData.find(b => b.abbrev === bookAbbrev || b.name === bookName);
      if (bookObj && bookObj.chapters[chapter - 1]) {
        const verses = bookObj.chapters[chapter - 1];
        let html = '';
        verses.forEach((verseText, vIdx) => {
          html += `<div class="bible-verse"><span class="verse-num">${vIdx + 1}</span>${verseText}</div>`;
        });
        textContainer.innerHTML = html;
        return;
      }
    }

    const key = `${bookAbbrev}_${chapter}`;
    if (acfTexts[key]) {
      const data = acfTexts[key];
      if (data.title) readerSubtitle.textContent = `${data.title} • Almeida Corrigida Fiel (ACF)`;
      let html = '';
      data.verses.forEach(v => {
        html += `<div class="bible-verse"><span class="verse-num">${v.v}</span>${v.text}</div>`;
      });
      textContainer.innerHTML = html;
    }
  }

  searchBible(query) {
    const searchResults = document.getElementById('bible-search-results');
    if (!this.fullBibleData) {
      searchResults.style.display = 'block';
      searchResults.innerHTML = `<div style="color:#94a3b8;font-size:0.85rem;">Carregando índice da Bíblia completa...</div>`;
      return;
    }

    const matches = [];
    const maxResults = 15;

    for (const book of this.fullBibleData) {
      for (let cIdx = 0; cIdx < book.chapters.length; cIdx++) {
        const chapter = book.chapters[cIdx];
        for (let vIdx = 0; vIdx < chapter.length; vIdx++) {
          const text = chapter[vIdx];
          if (text.toLowerCase().includes(query)) {
            matches.push({
              abbrev: book.abbrev,
              bookName: book.name,
              chapter: cIdx + 1,
              verse: vIdx + 1,
              text
            });
            if (matches.length >= maxResults) break;
          }
        }
        if (matches.length >= maxResults) break;
      }
      if (matches.length >= maxResults) break;
    }

    if (matches.length === 0) {
      searchResults.style.display = 'block';
      searchResults.innerHTML = `<div style="color:#94a3b8;font-size:0.85rem;">Nenhum versículo encontrado para "<strong>${query}</strong>".</div>`;
      return;
    }

    searchResults.style.display = 'block';
    let html = `<div style="font-size:0.8rem;color:#f59e0b;margin-bottom:0.5rem;font-weight:600;">Encontrados (${matches.length} versículos):</div>`;

    matches.forEach(m => {
      const highlighted = m.text.replace(new RegExp(query, 'gi'), (match) => `<span style="background:rgba(245,158,11,0.3);color:#fbbf24;font-weight:bold;">${match}</span>`);
      html += `
        <div class="search-result-item" style="padding:0.5rem; border-bottom:1px solid rgba(255,255,255,0.06); cursor:pointer;">
          <strong style="color:#38bdf8;">${m.bookName} ${m.chapter}:${m.verse}</strong> — <span style="font-size:0.85rem;color:#cbd5e1;">${highlighted}</span>
        </div>
      `;
    });

    searchResults.innerHTML = html;

    searchResults.querySelectorAll('.search-result-item').forEach((item, idx) => {
      item.addEventListener('click', () => {
        const m = matches[idx];
        const bookSelect = document.getElementById('bible-book-select');
        const chapterSelect = document.getElementById('bible-chapter-select');

        bookSelect.value = m.abbrev;
        const changeEvent = new Event('change');
        bookSelect.dispatchEvent(changeEvent);

        chapterSelect.value = String(m.chapter);
        this.displayBibleChapter();

        searchResults.style.display = 'none';
      });
    });
  }

  renderDevotional() {
    const container = document.getElementById('devotional-container');
    const dev = devocionaisInstrumentista[0];

    container.innerHTML = `
      <div class="devotional-card">
        <h3>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          Devocional do Instrumentista: ${dev.title}
        </h3>
        <blockquote>"${dev.verse}" (${dev.ref})</blockquote>
        <p>${dev.reflection}</p>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // DICIONÁRIO DE ACORDES (MODAL & SVG)
  // --------------------------------------------------------------------------
  initChordsModal() {
    const openBtn = document.getElementById('btn-open-chords');
    const closeBtn = document.getElementById('close-chords-modal');
    const modal = document.getElementById('chords-modal');
    const buttonsList = document.getElementById('chord-buttons-list');
    const guitarContainer = document.getElementById('guitar-chord-diagram-container');
    const bassDetails = document.getElementById('bass-chord-details');

    if (!openBtn || !modal) return;

    openBtn.addEventListener('click', () => {
      modal.style.display = 'flex';
      renderSelectedChord('C');
    });

    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });

    const chordsList = Object.keys(GUITAR_CHORDS);
    buttonsList.innerHTML = '';

    const renderSelectedChord = (chordKey) => {
      buttonsList.querySelectorAll('button').forEach(btn => {
        if (btn.dataset.chord === chordKey) {
          btn.classList.add('active-chord-btn');
        } else {
          btn.classList.remove('active-chord-btn');
        }
        btn.style.background = '';
        btn.style.color = '';
      });

      const svg = renderGuitarChordSVG(chordKey);
      guitarContainer.innerHTML = `
        <div style="font-size: 0.85rem; color: var(--gold-light); font-weight: 600; margin-bottom: 0.5rem;">🎸 Violão (${chordKey})</div>
        ${svg}
      `;

      const bassRoot = chordKey.replace(/m|7|M|sus/g, '');
      const bassInfo = BASS_ARPEGGIOS[bassRoot] || BASS_ARPEGGIOS['C'];

      bassDetails.innerHTML = `
        <div><strong>Acorde:</strong> ${chordKey}</div>
        <div style="margin-top:0.4rem;"><strong>Tônica:</strong> ${bassInfo.root}</div>
        <div><strong>Terça:</strong> ${bassInfo.third}</div>
        <div><strong>Quinta Justa:</strong> ${bassInfo.fifth}</div>
        <div><strong>Oitava:</strong> ${bassInfo.octave}</div>
        <div style="margin-top:0.6rem; font-size:0.8rem; color: var(--text-muted); font-style:italic;">
          💡 Dica de Baixo: Em hinos congregacionais, mantenha a Tônica no tempo 1 e a Quinta nos contratempos para um groove firme e reverente.
        </div>
      `;
    };

    chordsList.forEach(chordKey => {
      const btn = document.createElement('button');
      btn.textContent = chordKey;
      btn.dataset.chord = chordKey;
      btn.className = 'tool-btn';
      btn.style.padding = '0.35rem 0.65rem';
      btn.style.fontSize = '0.85rem';
      btn.addEventListener('click', () => renderSelectedChord(chordKey));
      buttonsList.appendChild(btn);
    });

    this.renderSelectedChord = renderSelectedChord;
  }

  showChordModal(chordKey = 'C') {
    const modal = document.getElementById('chords-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    let target = chordKey;
    if (!GUITAR_CHORDS[target] && target.includes('/')) {
      target = target.split('/')[0];
    }
    if (!GUITAR_CHORDS[target]) {
      const rootMatch = target.match(/^[A-G][b#]?m?/);
      if (rootMatch && GUITAR_CHORDS[rootMatch[0]]) {
        target = rootMatch[0];
      } else {
        target = 'C';
      }
    }
    if (this.renderSelectedChord) {
      this.renderSelectedChord(target);
    }
  }

  // --------------------------------------------------------------------------
  // METRÔNOMO
  // --------------------------------------------------------------------------
  initMetronome() {
    const bpmDisplay = document.getElementById('bpm-display');
    const bpmSlider = document.getElementById('bpm-slider');
    const tempoName = document.getElementById('tempo-name');
    const playBtn = document.getElementById('metro-play-btn');
    const tapBtn = document.getElementById('metro-tap-btn');
    const beatsSelect = document.getElementById('beats-select');
    const dotsContainer = document.getElementById('beat-dots-container');

    const tempoNames = [
      { max: 60, name: 'Largo / Lento' },
      { max: 76, name: 'Adagio' },
      { max: 108, name: 'Andante (Hinos de Oração)' },
      { max: 120, name: 'Moderato' },
      { max: 168, name: 'Allegro (Hinos de Júbilo)' },
      { max: 200, name: 'Presto' },
      { max: 260, name: 'Prestissimo' }
    ];

    const updateTempoName = (bpm) => {
      const match = tempoNames.find(t => bpm <= t.max) || tempoNames[tempoNames.length - 1];
      tempoName.textContent = match.name;
    };

    const renderBeatDots = () => {
      dotsContainer.innerHTML = '';
      const count = parseInt(beatsSelect.value, 10);
      for (let i = 0; i < count; i++) {
        const dot = document.createElement('div');
        dot.className = `beat-dot ${i === 0 ? 'accent-beat' : ''}`;
        dot.dataset.beat = i;
        dotsContainer.appendChild(dot);
      }
    };

    this.metronome = new MetronomeEngine((beatNumber) => {
      const dots = dotsContainer.querySelectorAll('.beat-dot');
      dots.forEach((dot, idx) => {
        if (idx === beatNumber) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    });

    const setBpm = (bpm) => {
      this.metronome.setBpm(bpm);
      bpmDisplay.textContent = this.metronome.bpm;
      bpmSlider.value = this.metronome.bpm;
      updateTempoName(this.metronome.bpm);
    };

    bpmSlider.addEventListener('input', (e) => setBpm(e.target.value));

    document.querySelectorAll('.step-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const step = parseInt(btn.dataset.step, 10);
        setBpm(this.metronome.bpm + step);
      });
    });

    beatsSelect.addEventListener('change', () => {
      this.metronome.setBeatsPerBar(beatsSelect.value);
      renderBeatDots();
    });

    playBtn.addEventListener('click', () => {
      if (this.metronome.isPlaying) {
        this.metronome.stop();
        playBtn.innerHTML = `
          <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        `;
        dotsContainer.querySelectorAll('.beat-dot').forEach(d => d.classList.remove('active'));
      } else {
        this.metronome.start();
        playBtn.innerHTML = `
          <svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        `;
      }
    });

    tapBtn.addEventListener('click', () => {
      const newBpm = this.metronome.tapTempo();
      setBpm(newBpm);
    });

    renderBeatDots();
    updateTempoName(this.metronome.bpm);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
