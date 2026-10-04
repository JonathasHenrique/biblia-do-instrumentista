// Afinador Profissional com Web Audio API para Violão, Contrabaixo e Modo Cromático

export class TunerEngine {
  constructor(onUpdate, onStatusChange) {
    this.onUpdate = onUpdate;
    this.onStatusChange = onStatusChange;
    this.audioCtx = null;
    this.analyser = null;
    this.mediaStream = null;
    this.sourceNode = null;
    this.isRunning = false;
    this.animationId = null;
    this.buffer = null;
    this.currentInstrument = "violao"; // violao, baixo4, baixo5, cromatico
    this.currentTuning = "standard";

    // Frequência A4 de calibração padrão (Hz)
    this.a4 = 440;

    // Presets de afinação
    this.instrumentPresets = {
      violao: {
        name: "Violão (6 Cordas)",
        tunings: {
          standard: {
            name: "Padrão (E A D G B E)",
            strings: [
              { name: "6ª Corda", note: "E", octave: 2, freq: 82.41 },
              { name: "5ª Corda", note: "A", octave: 2, freq: 110.00 },
              { name: "4ª Corda", note: "D", octave: 3, freq: 146.83 },
              { name: "3ª Corda", note: "G", octave: 3, freq: 196.00 },
              { name: "2ª Corda", note: "B", octave: 3, freq: 246.94 },
              { name: "1ª Corda", note: "E", octave: 4, freq: 329.63 }
            ]
          },
          dropD: {
            name: "Drop D (D A D G B E)",
            strings: [
              { name: "6ª Corda", note: "D", octave: 2, freq: 73.42 },
              { name: "5ª Corda", note: "A", octave: 2, freq: 110.00 },
              { name: "4ª Corda", note: "D", octave: 3, freq: 146.83 },
              { name: "3ª Corda", note: "G", octave: 3, freq: 196.00 },
              { name: "2ª Corda", note: "B", octave: 3, freq: 246.94 },
              { name: "1ª Corda", note: "E", octave: 4, freq: 329.63 }
            ]
          },
          halfStepDown: {
            name: "1/2 Tom Abaixo (Eb Ab Db Gb Bb Eb)",
            strings: [
              { name: "6ª Corda", note: "Eb", octave: 2, freq: 77.78 },
              { name: "5ª Corda", note: "Ab", octave: 2, freq: 103.83 },
              { name: "4ª Corda", note: "Db", octave: 3, freq: 138.59 },
              { name: "3ª Corda", note: "Gb", octave: 3, freq: 185.00 },
              { name: "2ª Corda", note: "Bb", octave: 3, freq: 233.08 },
              { name: "1ª Corda", note: "Eb", octave: 4, freq: 311.13 }
            ]
          },
          openG: {
            name: "Open G (D G D G B D)",
            strings: [
              { name: "6ª Corda", note: "D", octave: 2, freq: 73.42 },
              { name: "5ª Corda", note: "G", octave: 2, freq: 98.00 },
              { name: "4ª Corda", note: "D", octave: 3, freq: 146.83 },
              { name: "3ª Corda", note: "G", octave: 3, freq: 196.00 },
              { name: "2ª Corda", note: "B", octave: 3, freq: 246.94 },
              { name: "1ª Corda", note: "D", octave: 4, freq: 293.66 }
            ]
          },
          dadgad: {
            name: "DADGAD (Celta / Louvor)",
            strings: [
              { name: "6ª Corda", note: "D", octave: 2, freq: 73.42 },
              { name: "5ª Corda", note: "A", octave: 2, freq: 110.00 },
              { name: "4ª Corda", note: "D", octave: 3, freq: 146.83 },
              { name: "3ª Corda", note: "G", octave: 3, freq: 196.00 },
              { name: "2ª Corda", note: "A", octave: 3, freq: 220.00 },
              { name: "1ª Corda", note: "D", octave: 4, freq: 293.66 }
            ]
          }
        }
      },
      baixo4: {
        name: "Contrabaixo (4 Cordas)",
        tunings: {
          standard: {
            name: "Padrão (E A D G)",
            strings: [
              { name: "4ª Corda", note: "E", octave: 1, freq: 41.20 },
              { name: "3ª Corda", note: "A", octave: 1, freq: 55.00 },
              { name: "2ª Corda", note: "D", octave: 2, freq: 73.42 },
              { name: "1ª Corda", note: "G", octave: 2, freq: 98.00 }
            ]
          },
          dropD: {
            name: "Drop D (D A D G)",
            strings: [
              { name: "4ª Corda", note: "D", octave: 1, freq: 36.71 },
              { name: "3ª Corda", note: "A", octave: 1, freq: 55.00 },
              { name: "2ª Corda", note: "D", octave: 2, freq: 73.42 },
              { name: "1ª Corda", note: "G", octave: 2, freq: 98.00 }
            ]
          },
          halfStepDown: {
            name: "1/2 Tom Abaixo (Eb Ab Db Gb)",
            strings: [
              { name: "4ª Corda", note: "Eb", octave: 1, freq: 38.89 },
              { name: "3ª Corda", note: "Ab", octave: 1, freq: 51.91 },
              { name: "2ª Corda", note: "Db", octave: 2, freq: 69.30 },
              { name: "1ª Corda", note: "Gb", octave: 2, freq: 92.50 }
            ]
          }
        }
      },
      baixo5: {
        name: "Contrabaixo (5 Cordas)",
        tunings: {
          standard: {
            name: "Padrão com Si Grave (B E A D G)",
            strings: [
              { name: "5ª Corda", note: "B", octave: 0, freq: 30.87 },
              { name: "4ª Corda", note: "E", octave: 1, freq: 41.20 },
              { name: "3ª Corda", note: "A", octave: 1, freq: 55.00 },
              { name: "2ª Corda", note: "D", octave: 2, freq: 73.42 },
              { name: "1ª Corda", note: "G", octave: 2, freq: 98.00 }
            ]
          }
        }
      },
      baixo6: {
        name: "Contrabaixo (6 Cordas)",
        tunings: {
          standard: {
            name: "Padrão 6C (B E A D G C)",
            strings: [
              { name: "6ª Corda", note: "B", octave: 0, freq: 30.87 },
              { name: "5ª Corda", note: "E", octave: 1, freq: 41.20 },
              { name: "4ª Corda", note: "A", octave: 1, freq: 55.00 },
              { name: "3ª Corda", note: "D", octave: 2, freq: 73.42 },
              { name: "2ª Corda", note: "G", octave: 2, freq: 98.00 },
              { name: "1ª Corda", note: "C", octave: 3, freq: 130.81 }
            ]
          }
        }
      },
      cromatico: {
        name: "Modo Cromático",
        tunings: {
          standard: {
            name: "Todas as Notas (C0 - B8)",
            strings: []
          }
        }
      }
    };

    this.noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  }

  async start() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();

      // Buffer grande (4096 ou 8192) para captar frequências sub-graves de contrabaixo (B0 ~ 31Hz)
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 4096;
      this.buffer = new Float32Array(this.analyser.fftSize);

      const constraints = {
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1
        }
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.sourceNode = this.audioCtx.createMediaStreamSource(this.mediaStream);
      this.sourceNode.connect(this.analyser);

      this.isRunning = true;
      if (this.onStatusChange) this.onStatusChange(true);
      this.processAudio();
    } catch (err) {
      console.error("Erro ao iniciar afinador:", err);
      if (this.onStatusChange) this.onStatusChange(false, err.message);
      throw err;
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioCtx && this.audioCtx.state !== "closed") {
      this.audioCtx.close();
      this.audioCtx = null;
    }
    if (this.onStatusChange) this.onStatusChange(false);
  }

  processAudio() {
    if (!this.isRunning) return;

    this.analyser.getFloatTimeDomainData(this.buffer);

    // Calcular nível de sinal (RMS)
    let sum = 0;
    for (let i = 0; i < this.buffer.length; i++) {
      sum += this.buffer[i] * this.buffer[i];
    }
    const rms = Math.sqrt(sum / this.buffer.length);

    // Limiar de silêncio para evitar ruído de fundo
    if (rms > 0.008) {
      const pitch = this.autoCorrelate(this.buffer, this.audioCtx.sampleRate);
      if (pitch !== -1 && pitch >= 25 && pitch <= 2000) {
        const noteData = this.getNoteFromPitch(pitch);
        if (this.onUpdate) {
          this.onUpdate({
            hasSignal: true,
            rms,
            frequency: pitch,
            ...noteData
          });
        }
      } else {
        if (this.onUpdate) this.onUpdate({ hasSignal: true, rms, frequency: 0 });
      }
    } else {
      if (this.onUpdate) this.onUpdate({ hasSignal: false, rms, frequency: 0 });
    }

    this.animationId = requestAnimationFrame(() => this.processAudio());
  }

  // Algoritmo de Autocorrelação com Interpolação Parabólica de Alta Precisão
  autoCorrelate(buffer, sampleRate) {
    const SIZE = buffer.length;
    let r1 = 0;
    let r2 = SIZE - 1;
    const threshold = 0.15;

    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < threshold) {
        r1 = i;
        break;
      }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < threshold) {
        r2 = SIZE - i;
        break;
      }
    }

    const trimmedBuffer = buffer.slice(r1, r2);
    const c = new Float32Array(trimmedBuffer.length);

    for (let lag = 0; lag < trimmedBuffer.length; lag++) {
      let sum = 0;
      for (let i = 0; i < trimmedBuffer.length - lag; i++) {
        sum += trimmedBuffer[i] * trimmedBuffer[i + lag];
      }
      c[lag] = sum;
    }

    let d = 0;
    while (c[d] > c[d + 1] && d < c.length - 1) d++;

    let maxval = -1;
    let maxpos = -1;
    for (let i = d; i < c.length; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }

    if (maxpos === -1 || maxval < c[0] * 0.25) return -1;

    // Refinamento parabólico do pico para precisão sub-sample
    let T0 = maxpos;
    if (maxpos > 0 && maxpos < c.length - 1) {
      const x1 = c[maxpos - 1];
      const x2 = c[maxpos];
      const x3 = c[maxpos + 1];
      const a = (x1 + x3 - 2 * x2) / 2;
      const b = (x3 - x1) / 2;
      if (a !== 0) {
        T0 = maxpos - b / (2 * a);
      }
    }

    return sampleRate / T0;
  }

  // Converte frequência (Hz) para nota musical, oitava e desvio em cents
  getNoteFromPitch(frequency) {
    const noteNum = 12 * (Math.log(frequency / this.a4) / Math.log(2)) + 69;
    const roundedNote = Math.round(noteNum);
    const targetFreq = this.a4 * Math.pow(2, (roundedNote - 69) / 12);
    const cents = Math.floor(1200 * (Math.log(frequency / targetFreq) / Math.log(2)));

    const noteName = this.noteStrings[roundedNote % 12];
    const octave = Math.floor(roundedNote / 12) - 1;

    // Detectar corda mais próxima de acordo com o instrumento selecionado
    let closestString = null;
    const currentStrings = this.getStrings();
    if (currentStrings.length > 0) {
      let minDiff = Infinity;
      currentStrings.forEach(str => {
        const diff = Math.abs(frequency - str.freq);
        if (diff < minDiff) {
          minDiff = diff;
          closestString = str;
        }
      });
    }

    return {
      note: noteName,
      octave,
      cents: Math.max(-50, Math.min(50, cents)),
      targetFreq,
      diffHz: frequency - targetFreq,
      isTuned: Math.abs(cents) <= 4,
      closestString
    };
  }

  getStrings() {
    const inst = this.instrumentPresets[this.currentInstrument];
    if (!inst) return [];
    const tuning = inst.tunings[this.currentTuning] || Object.values(inst.tunings)[0];
    return tuning.strings || [];
  }

  setA4(freq) {
    this.a4 = parseFloat(freq) || 440;
  }

  // Diapasão / Gerador de som de referência
  playTone(freq, duration = 2.0) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = this.audioCtx || new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle"; // Som mais quente e acústico
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Falha ao tocar som de referência:", e);
    }
  }
}
