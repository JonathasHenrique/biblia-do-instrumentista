// Metrônomo com Web Audio API e agendamento preciso (Lookahead Scheduler)

export class MetronomeEngine {
  constructor(onBeat) {
    this.onBeat = onBeat;
    this.audioCtx = null;
    this.isPlaying = false;
    this.bpm = 100;
    this.beatsPerBar = 4;
    this.currentBeat = 0;
    this.nextNoteTime = 0.0;
    this.lookahead = 25.0; // ms
    this.scheduleAheadTime = 0.1; // segundos
    this.timerId = null;

    // Histórico de Tap Tempo
    this.tapTimes = [];
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
  }

  nextNote() {
    const secondsPerBeat = 60.0 / this.bpm;
    this.nextNoteTime += secondsPerBeat;
    this.currentBeat = (this.currentBeat + 1) % this.beatsPerBar;
  }

  scheduleNote(beatNumber, time) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    // Beat 1 é mais agudo (acento), os outros são mais graves
    const isAccent = beatNumber === 0;
    osc.frequency.value = isAccent ? 1200 : 800;

    gain.gain.setValueAtTime(isAccent ? 0.35 : 0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(time);
    osc.stop(time + 0.05);

    // Notificar UI no momento exato
    const delay = Math.max(0, (time - this.audioCtx.currentTime) * 1000);
    setTimeout(() => {
      if (this.isPlaying && this.onBeat) {
        this.onBeat(beatNumber, isAccent);
      }
    }, delay);
  }

  scheduler() {
    while (this.nextNoteTime < this.audioCtx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentBeat, this.nextNoteTime);
      this.nextNote();
    }
    if (this.isPlaying) {
      this.timerId = setTimeout(() => this.scheduler(), this.lookahead);
    }
  }

  start() {
    this.initAudio();
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    this.isPlaying = true;
    this.currentBeat = 0;
    this.nextNoteTime = this.audioCtx.currentTime + 0.05;
    this.scheduler();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.currentBeat = 0;
  }

  setBpm(newBpm) {
    this.bpm = Math.max(30, Math.min(260, parseInt(newBpm, 10)));
  }

  setBeatsPerBar(beats) {
    this.beatsPerBar = parseInt(beats, 10);
    this.currentBeat = 0;
  }

  tapTempo() {
    const now = performance.now();
    this.tapTimes.push(now);

    // Manter apenas os últimos 5 toques
    if (this.tapTimes.length > 5) {
      this.tapTimes.shift();
    }

    if (this.tapTimes.length >= 2) {
      let intervals = [];
      for (let i = 1; i < this.tapTimes.length; i++) {
        intervals.push(this.tapTimes[i] - this.tapTimes[i - 1]);
      }
      // Se o intervalo for maior que 2 segundos, reiniciar
      if (intervals[intervals.length - 1] > 2000) {
        this.tapTimes = [now];
        return this.bpm;
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 30 && calculatedBpm <= 260) {
        this.setBpm(calculatedBpm);
        return calculatedBpm;
      }
    }
    return this.bpm;
  }
}
