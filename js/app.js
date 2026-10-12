// Orquestrador Principal do Aplicativo "Bíblia do Instrumentista"
// Suporte Integral: Bíblia Sagrada ACF Completa, Harpa Cristã com Partituras Interativas (ABCJS),
// Seletor Funcional de Tons, Campo Harmônico, Dicionário de Acordes, Afinador e Metrônomo.

import { TunerEngine } from './tuner.js';
import { MetronomeEngine } from './metronome.js';
import { harpaHymns } from '../data/harpaData.js';
import { bibleBooks as defaultBooks, acfTexts, devocionaisInstrumentista } from '../data/bibliaData.js';
import { transposeText, transposeChord, isChordLine } from './transposer.js';
import { GUITAR_CHORDS, BASS_ARPEGGIOS, renderGuitarChordSVG } from './chords.js';
import { ALL_TONES, getHarmonicField, calculateSemitones, getCapoRecommendation } from './toneSelector.js';
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
    this.activeCapo = null;
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
    this.initDonateModal();
    this.initCapoModal();

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

    // Pré-aquecimento do Web Audio API no primeiro gesto do usuário (elimina latência e cold-start)
    const warmupAudio = () => {
      if (this.tuner) {
        this.tuner.getPlaybackContext();
      }
      window.removeEventListener('pointerdown', warmupAudio);
      window.removeEventListener('keydown', warmupAudio);
      window.removeEventListener('touchstart', warmupAudio);
    };
    window.addEventListener('pointerdown', warmupAudio, { once: true, passive: true });
    window.addEventListener('keydown', warmupAudio, { once: true, passive: true });
    window.addEventListener('touchstart', warmupAudio, { once: true, passive: true });
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
    const fontSizeLabel = document.getElementById('current-font-size-label');
    const chordSheet = document.getElementById('chord-sheet-content');

    // Drawer / Barra Lateral de Hinos no Mobile
    const btnToggleHymnList = document.getElementById('btn-toggle-hymn-list');
    const btnCloseHymnSidebar = document.getElementById('btn-close-hymn-sidebar');
    const hymnSidebar = document.getElementById('harpa-sidebar');
    const sidebarBackdrop = document.getElementById('harpa-sidebar-backdrop');

    this.openHymnSidebar = () => {
      if (hymnSidebar) hymnSidebar.classList.add('open');
      if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 150);
      }
    };

    this.closeHymnSidebar = () => {
      if (hymnSidebar) hymnSidebar.classList.remove('open');
      if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
    };

    if (btnToggleHymnList) btnToggleHymnList.addEventListener('click', () => this.openHymnSidebar());
    if (btnCloseHymnSidebar) btnCloseHymnSidebar.addEventListener('click', () => this.closeHymnSidebar());
    if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', () => this.closeHymnSidebar());

    // Painel Retrátil de Mais Configurações (Mudar Tom Completo, Campo Harmônico, Ferramentas)
    const btnToggleSettings = document.getElementById('btn-toggle-harpa-settings');
    const btnCloseSettings = document.getElementById('btn-close-harpa-settings');
    const settingsPanel = document.getElementById('harpa-collapsible-settings');
    const settingsChevron = document.getElementById('settings-chevron');

    this.toggleHarpaSettings = (forceState = null) => {
      const shouldOpen = forceState !== null ? forceState : settingsPanel.classList.contains('collapsed');
      if (shouldOpen) {
        settingsPanel.classList.remove('collapsed');
        if (btnToggleSettings) btnToggleSettings.classList.add('active');
        if (settingsChevron) settingsChevron.textContent = '▲';
      } else {
        settingsPanel.classList.add('collapsed');
        if (btnToggleSettings) btnToggleSettings.classList.remove('active');
        if (settingsChevron) settingsChevron.textContent = '▼';
      }
    };

    if (btnToggleSettings) {
      btnToggleSettings.addEventListener('click', () => this.toggleHarpaSettings());
    }
    if (btnCloseSettings) {
      btnCloseSettings.addEventListener('click', () => this.toggleHarpaSettings(false));
    }

    // Modo Foco / Leitura Imersiva (oculta cabeçalho do app para ver 100% da letra)
    const btnToggleFocus = document.getElementById('btn-toggle-focus');
    const btnExitFocusFloating = document.getElementById('btn-exit-focus-floating');

    this.toggleFocusMode = () => {
      this.isFocusMode = !this.isFocusMode;
      document.body.classList.toggle('focus-mode-active', this.isFocusMode);
      const focusIcon = document.getElementById('focus-btn-icon');
      if (focusIcon) {
        focusIcon.textContent = this.isFocusMode ? '✕' : '⛶';
      }
      if (btnToggleFocus) {
        btnToggleFocus.classList.toggle('active', this.isFocusMode);
        btnToggleFocus.title = this.isFocusMode ? 'Sair do Modo Foco' : 'Modo Foco (oculta menus do topo)';
      }
    };

    if (btnToggleFocus) btnToggleFocus.addEventListener('click', () => this.toggleFocusMode());
    if (btnExitFocusFloating) btnExitFocusFloating.addEventListener('click', () => this.toggleFocusMode());

    // Navegação Direta de Hinos (Anterior / Próximo)
    const btnPrevHymn = document.getElementById('btn-prev-hymn');
    const btnNextHymn = document.getElementById('btn-next-hymn');

    this.navigateHymn = (step) => {
      if (!this.selectedHymn || !this.hymnsList.length) return;
      const curIdx = this.hymnsList.findIndex(h => h.number === this.selectedHymn.number);
      if (curIdx === -1) return;
      const targetIdx = (curIdx + step + this.hymnsList.length) % this.hymnsList.length;
      const targetHymn = this.hymnsList[targetIdx];
      if (targetHymn) {
        this.selectedHymn = targetHymn;
        this.hymnTranspose = 0;
        document.querySelectorAll('.hymn-item').forEach(i => i.classList.remove('active'));
        const activeItem = document.querySelector(`.hymn-item[data-hymn-number="${targetHymn.number}"]`);
        if (activeItem) {
          activeItem.classList.add('active');
          activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
        this.renderHymnContent();
      }
    };

    if (btnPrevHymn) btnPrevHymn.addEventListener('click', () => this.navigateHymn(-1));
    if (btnNextHymn) btnNextHymn.addEventListener('click', () => this.navigateHymn(1));

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
          if (toggleChordsLabel) toggleChordsLabel.textContent = 'Cifras';
          toggleChordsBtn.title = 'Clique para ocultar as cifras e deixar apenas a letra completa para cantar';
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
    if (btnTransposeUp) {
      btnTransposeUp.addEventListener('click', () => {
        this.activeCapo = null;
        this.hymnTranspose += 1;
        this.renderHymnContent();
      });
    }
    if (btnTransposeDown) {
      btnTransposeDown.addEventListener('click', () => {
        this.activeCapo = null;
        this.hymnTranspose -= 1;
        this.renderHymnContent();
      });
    }
    if (btnTransposeReset) {
      btnTransposeReset.addEventListener('click', () => {
        this.activeCapo = null;
        this.hymnTranspose = 0;
        this.renderHymnContent();
      });
    }

    // Rolagem Automática
    if (btnAutoScroll) {
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
    }

    // Tamanho da Fonte com Indicador Visual e Persistência
    const updateFontSizeDisplay = () => {
      if (chordSheet) chordSheet.style.fontSize = `${this.fontSize}px`;
      if (fontSizeLabel) fontSizeLabel.textContent = `${this.fontSize}px`;
      localStorage.setItem('bi_font_size', this.fontSize);
    };

    if (btnFontPlus) {
      btnFontPlus.addEventListener('click', () => {
        if (this.fontSize < 28) {
          this.fontSize += 1;
          updateFontSizeDisplay();
        }
      });
    }
    if (btnFontMinus) {
      btnFontMinus.addEventListener('click', () => {
        if (this.fontSize > 12) {
          this.fontSize -= 1;
          updateFontSizeDisplay();
        }
      });
    }
    updateFontSizeDisplay();

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
        this.activeCapo = null;
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

          // Ordem cantada congregacional oficial com harmonia litúrgica completa: 1ª Estrofe -> Refrão...
          verseKeys.forEach((vNum) => {
            const vText = (verses[vNum] || '').replace(/\s*Autor:.*$/i, '').trim();
            const vLines = vText.split(/<br\s*\/?>/gi).map(l => l.trim()).filter(Boolean);
            const label = isNaN(vNum) ? `[Estrofe ${vNum}]` : `[${vNum}ª Estrofe]`;
            const harmonizedVerse = this.buildHarmonizedSection(vLines, tone, false);
            formattedLyrics += `${label}\n${harmonizedVerse}\n\n`;

            if (coroLines.length > 0) {
              const harmonizedCoro = this.buildHarmonizedSection(coroLines, tone, true);
              formattedLyrics += `[Refrão]\n${harmonizedCoro}\n\n`;
            }
          });

          // Caso raro de hino composto apenas de coro
          if (verseKeys.length === 0 && coroLines.length > 0) {
            const harmonizedCoro = this.buildHarmonizedSection(coroLines, tone, true);
            formattedLyrics += `[Refrão]\n${harmonizedCoro}\n\n`;
          }

          const rawTitle = raw.hino || `Hino ${i}`;
          const cleanTitle = rawTitle.replace(/^\d+\s*-\s*/, '').trim();

          fullList.push({
            number: i,
            title: cleanTitle,
            author: "Harpa Cristã Clássica",
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

  buildHarmonizedSection(lines, tone, isCoro) {
    if (!lines || lines.length === 0) return '';
    const hf = getHarmonicField(tone);
    const I = hf.I;
    const ii = hf.ii;
    const IV = hf.IV;
    const V = hf.V;
    const V7 = hf.V7;
    const vi = hf.vi;

    const total = lines.length;
    const outLines = [];

    for (let idx = 0; idx < total; idx++) {
      const lyric = lines[idx];
      const len = Math.max(lyric.length, 28);

      let chordList = [];
      if (total === 4) {
        if (idx === 0) chordList = [I, IV, I];
        else if (idx === 1) chordList = [vi, ii, V7];
        else if (idx === 2) chordList = [I, IV, I];
        else chordList = [vi, ii, V7, I];
      } else if (total === 8) {
        if (idx === 0) chordList = [I, IV];
        else if (idx === 1) chordList = [I, V7];
        else if (idx === 2) chordList = [I, IV];
        else if (idx === 3) chordList = [I, V7, I];
        else if (idx === 4) chordList = [I, IV];
        else if (idx === 5) chordList = [vi, V7];
        else if (idx === 6) chordList = [I, IV];
        else chordList = [I, V7, I];
      } else if (total === 2) {
        if (idx === 0) chordList = [I, IV, I];
        else chordList = [vi, ii, V7, I];
      } else if (total === 3) {
        if (idx === 0) chordList = [I, IV];
        else if (idx === 1) chordList = [vi, V7];
        else chordList = [IV, V7, I];
      } else if (total === 5) {
        if (idx === 0) chordList = [I, IV];
        else if (idx === 1) chordList = [I, V];
        else if (idx === 2) chordList = [I, IV];
        else if (idx === 3) chordList = [vi, V7];
        else chordList = [IV, V7, I];
      } else if (total === 6) {
        if (idx === 0) chordList = [I, IV, I];
        else if (idx === 1) chordList = [I, V];
        else if (idx === 2) chordList = [I, IV, I];
        else if (idx === 3) chordList = [I, V];
        else if (idx === 4) chordList = [vi, ii, V7];
        else chordList = [IV, V7, I];
      } else {
        if (idx === total - 1) chordList = [vi, ii, V7, I];
        else if (idx % 2 === 0) chordList = [I, IV, I];
        else chordList = [vi, ii, V7];
      }

      let chordLine = '';
      if (chordList.length === 2) {
        const p2 = Math.max(chordList[0].length + 2, Math.floor(len * 0.52));
        chordLine = chordList[0] + ' '.repeat(Math.max(1, p2 - chordList[0].length)) + chordList[1];
      } else if (chordList.length === 3) {
        const p2 = Math.max(chordList[0].length + 2, Math.floor(len * 0.42));
        const p3 = Math.max(p2 + chordList[1].length + 2, Math.floor(len * 0.82));
        const s1 = ' '.repeat(Math.max(1, p2 - chordList[0].length));
        const s2 = ' '.repeat(Math.max(1, p3 - (p2 + chordList[1].length)));
        chordLine = chordList[0] + s1 + chordList[1] + s2 + chordList[2];
      } else if (chordList.length === 4) {
        const p2 = Math.max(chordList[0].length + 2, Math.floor(len * 0.26));
        const p3 = Math.max(p2 + chordList[1].length + 2, Math.floor(len * 0.56));
        const p4 = Math.max(p3 + chordList[2].length + 2, Math.floor(len * 0.86));
        const s1 = ' '.repeat(Math.max(1, p2 - chordList[0].length));
        const s2 = ' '.repeat(Math.max(1, p3 - (p2 + chordList[1].length)));
        const s3 = ' '.repeat(Math.max(1, p4 - (p3 + chordList[2].length)));
        chordLine = chordList[0] + s1 + chordList[1] + s2 + chordList[2] + s3 + chordList[3];
      } else {
        chordLine = chordList.join('        ');
      }

      outLines.push(chordLine);
      outLines.push(lyric);
    }

    return outLines.join('\n');
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
      item.dataset.hymnNumber = h.number;
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
        this.activeCapo = null;
        document.querySelectorAll('.hymn-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        if (this.closeHymnSidebar) this.closeHymnSidebar();
        this.renderHymnContent();
      });
      hymnListContainer.appendChild(item);
    });
  }

  renderHymnContent() {
    const lyricsBody = document.getElementById('lyrics-chords-body');
    const toneBadge = document.getElementById('current-tone-badge');
    const harmonicFieldEl = document.getElementById('harmonic-field-display');
    const quickHymnLabel = document.getElementById('current-hymn-quick-label');

    if (!this.selectedHymn) return;

    // Atualizar seletor rápido no topo da barra compacta
    if (quickHymnLabel) {
      quickHymnLabel.textContent = `Nº ${this.selectedHymn.number} - ${this.selectedHymn.title}`;
    }

    // Calcular tom efetivo
    const baseTone = this.selectedHymn.tone || 'C';
    const effectiveTone = transposeChord(baseTone, this.hymnTranspose);

    // Atualizar badge do tom
    if (this.activeCapo) {
      toneBadge.innerHTML = `Capo ${this.activeCapo.fret}ª casa <small style="opacity:0.85;">(Forma [${this.activeCapo.shape}] • Som: ${this.activeCapo.originalTone})</small>`;
    } else {
      const toneDiff = this.hymnTranspose;
      const tonePrefix = toneDiff > 0 ? `+${toneDiff}` : toneDiff < 0 ? `${toneDiff}` : '';
      toneBadge.textContent = `Tom: ${effectiveTone} ${tonePrefix ? `(${tonePrefix})` : '(Orig)'}`;
    }

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
    const capoRec = hf.capoRec || getCapoRecommendation(effectiveTone);

    let capoHtml = '';
    if (this.activeCapo) {
      capoHtml = `
        <div class="capo-recommendation-bar" style="border-color: var(--gold-primary);">
          <div class="capo-tip-text capo-tip-text-accent">
            🎸 <strong>Capo na ${this.activeCapo.fret}ª casa ativo:</strong> Você toca formas fáceis de [${this.activeCapo.shape}]. Som real afinado em [${this.activeCapo.originalTone}].
          </div>
          <div class="capo-buttons-group">
            <button class="btn-reset-capo" id="btn-reset-capo-hf">✕ Desativar Capo</button>
            <button class="capo-help-btn" id="btn-open-capo-modal">❓ O que é Capo?</button>
          </div>
        </div>
      `;
    } else {
      const applyBtnHtml = (capoRec.shape && capoRec.needsCapo)
        ? `<button class="apply-capo-btn" id="btn-apply-capo">🎸 Tocar com Capo na ${capoRec.fret}ª casa (Forma [${capoRec.shape}])</button>`
        : '';
      capoHtml = `
        <div class="capo-recommendation-bar">
          <div class="capo-tip-text">
            ${capoRec.needsCapo ? '💡' : '🟢'} ${capoRec.tipText}
          </div>
          <div class="capo-buttons-group">
            ${applyBtnHtml}
            <button class="capo-help-btn" id="btn-open-capo-modal">❓ O que é Capo?</button>
          </div>
        </div>
      `;
    }

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
      </div>
      ${capoHtml}
    `;

    // Vincular botões do Capo
    const btnApplyCapo = document.getElementById('btn-apply-capo');
    if (btnApplyCapo && capoRec.shape) {
      btnApplyCapo.onclick = () => {
        this.activeCapo = {
          fret: capoRec.fret,
          shape: capoRec.shape,
          originalTone: effectiveTone,
          transposeDiff: capoRec.transposeDiff
        };
        this.hymnTranspose += capoRec.transposeDiff;
        this.renderHymnContent();
      };
    }

    const btnResetHf = document.getElementById('btn-reset-capo-hf');
    if (btnResetHf && this.activeCapo) {
      btnResetHf.onclick = () => {
        this.hymnTranspose -= this.activeCapo.transposeDiff;
        this.activeCapo = null;
        this.renderHymnContent();
      };
    }

    const btnOpenCapoModal = document.getElementById('btn-open-capo-modal');
    if (btnOpenCapoModal) {
      btnOpenCapoModal.onclick = () => {
        const modal = document.getElementById('capo-modal');
        if (modal) modal.style.display = 'flex';
      };
    }

    // Processamento linha a linha à prova de falhas:
    // Separa rigorosamente linhas de acordes de linhas de letra cantada.
    // Palavras com acentos ("Dá-nos", "Dá-lhes"), conjunções ("E", "A") e preposições ("Em")
    // NUNCA são tratadas como cifras.
    const CHORD_MATCH_REGEX = /\b([A-G][b#]?(?:m|maj|Maj|min|dim|aug|sus[24]?|[0-9]+|[º°+]|\/[0-9]+|\/[A-G][b#]?)*(?:\((?:add)?[0-9b#+-]+\))?)/g;

    const rawLyrics = this.selectedHymn.lyrics || '';
    const rawLines = rawLyrics.split(/\r?\n/);
    const htmlLines = [];
    let hasRenderedIntro = false;
    let inCoro = false;

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
        inCoro = /coro|refr[aã]o/i.test(sectionTitle);
        htmlLines.push(`<div class="section-tag ${inCoro ? 'is-coro-tag' : ''}">${sectionTitle}</div>`);
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
      const coroClass = inCoro ? ' coro-line' : '';
      htmlLines.push(`<div class="lyric-line${coroClass}">${safeLyric}</div>`);
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

    let activeCapoTopBanner = '';
    if (this.activeCapo) {
      activeCapoTopBanner = `
        <div class="capo-active-banner">
          <div>
            🎸 <strong>CAPO ATIVADO NA ${this.activeCapo.fret}ª CASA:</strong> 
            Você toca os acordes de <strong>[${this.activeCapo.shape}]</strong>. O som real sairá perfeitamente afinado em <strong>${this.activeCapo.originalTone}</strong> com a congregação!
          </div>
          <button id="btn-reset-capo-top" class="btn-reset-capo">✕ Desativar Capo (Voltar ao Tom Real)</button>
        </div>
      `;
    }

    const cleanAuthor = (this.selectedHymn.author || '')
      .replace(/\s*\(?CPAD\)?/gi, '')
      .trim();
    const authorText = (cleanAuthor && !/harpa crist[aã]|hin[aá]rio/i.test(cleanAuthor))
      ? `Autor: ${cleanAuthor}`
      : `Hinário Tradicional`;

    lyricsBody.innerHTML = `
      <div class="chord-sheet-header">
        <h2>${this.selectedHymn.number}. ${this.selectedHymn.title}</h2>
        <p>Ritmo: ${this.selectedHymn.rhythm || 'Padrão'} | Tom Original: ${this.selectedHymn.tone} | ${authorText}</p>
        ${activeCapoTopBanner}
        ${introTopBanner}
      </div>
      <div class="hymn-sheet-body">
        ${htmlLines.join('')}
      </div>
    `;

    const btnResetTop = document.getElementById('btn-reset-capo-top');
    if (btnResetTop && this.activeCapo) {
      btnResetTop.onclick = () => {
        this.hymnTranspose -= this.activeCapo.transposeDiff;
        this.activeCapo = null;
        this.renderHymnContent();
      };
    }

    // Aplicar estado de visibilidade de cifras (Cifras Ligadas vs Só Letra)
    if (this.updateChordsVisibility) {
      this.updateChordsVisibility();
    }

    const chordSheet = document.getElementById('chord-sheet-content');
    if (chordSheet) {
      chordSheet.scrollTop = 0;
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
      const chordData = GUITAR_CHORDS[chordKey];
      const hasBar = chordData && chordData.bar;
      const baseFretText = chordData && chordData.baseFret > 1 ? `${chordData.baseFret}ª casa` : '1ª casa';

      const pestanaTipHtml = hasBar
        ? `<div class="chord-tip-pestana">
            ⚠️ <strong>Acorde com Pestana (${chordData.baseFret}ª casa):</strong> O dedo indicador (1) deita reto cobrindo as cordas. Apoie o polegar na metade de trás do braço do violão e gire o indicador ligeiramente de lado para a nota soar limpa sem dor na mão!
          </div>`
        : `<div class="chord-tip-open">
            ✨ <strong>Acorde Aberto (Sem Pestana):</strong> Curvar bem as pontas dos dedos para não esbarrar nem abafar as cordas soltas (marcadas com 🟢 O).
          </div>`;

      guitarContainer.innerHTML = `
        <div style="font-size: 0.85rem; color: var(--gold-light); font-weight: 600; margin-bottom: 0.5rem;">🎸 Violão (${chordKey}${chordData && chordData.name ? ` - ${chordData.name}` : ''})</div>
        ${svg}
        <div class="chord-beginner-guide">
          <div class="chord-legend-row">
            <span><strong>Dedos:</strong> 1=Indicador | 2=Médio | 3=Anelar | 4=Mínimo</span>
          </div>
          <div class="chord-legend-row">
            <span><strong style="color:#10b981;">O</strong> = Corda Solta</span> | 
            <span><strong style="color:#ef4444;">✕</strong> = Não Tocar</span> | 
            <span>📍 Posição: <strong>${baseFretText}</strong></span>
          </div>
          ${pestanaTipHtml}
        </div>
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

  initDonateModal() {
    const donateBtn = document.getElementById('donate-btn');
    const modal = document.getElementById('modal-donate');
    const closeBtn = document.getElementById('btn-close-donate');
    const closeFooterBtn = document.getElementById('btn-close-donate-footer');

    if (donateBtn && modal) {
      donateBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
      });
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          modal.style.display = 'none';
        });
      }
      if (closeFooterBtn) {
        closeFooterBtn.addEventListener('click', () => {
          modal.style.display = 'none';
        });
      }
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
      });
    }
  }

  initCapoModal() {
    const modal = document.getElementById('capo-modal');
    const closeBtn = document.getElementById('close-capo-modal');
    const understoodBtn = document.getElementById('btn-understood-capo');

    if (modal) {
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          modal.style.display = 'none';
        });
      }
      if (understoodBtn) {
        understoodBtn.addEventListener('click', () => {
          modal.style.display = 'none';
        });
      }
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
      });
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
