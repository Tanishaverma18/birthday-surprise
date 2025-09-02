// Vanilla JS implementation of the interactive birthday surprise
// Mapping from original React components:
// - Cake (cake.tsx) -> HTML structure + CSS animations
// - Surprise (surprise.tsx) -> state machine below (candlesLit -> revealed)
// - ConfettiCanvas (confetti-canvas.tsx) -> Confetti class managing a canvas

(function() {
  const TARGET_NAME = 'Sanjana';

  // Elements
  const lightBtn = document.getElementById('light-btn');
  const wishBtn = document.getElementById('wish-btn');
  const replayBtn = document.getElementById('replay-btn');
  const paletteBtn = document.getElementById('palette-btn');
  const musicBtn = document.getElementById('music-btn');
  const message = document.getElementById('message');
  const hint = document.getElementById('hint');
  const confettiCanvas = document.getElementById('confetti');
  const candles = document.querySelectorAll('.candle');
  const cakeName = document.getElementById('cake-name');
  const targetNameEl = document.getElementById('target-name');
  const balloonsContainer = document.getElementById('balloons');
  cakeName.textContent = TARGET_NAME;
  targetNameEl.textContent = TARGET_NAME;

  let candlesLit = false;
  let revealed = false;

  setMessage('Tap “Light Candles” to begin the celebration.');

  lightBtn.addEventListener('click', () => {
    if (candlesLit) return;
    candlesLit = true;
    candles.forEach(c => c.classList.add('lit'));
    lightBtn.classList.add('hidden');
    wishBtn.classList.remove('hidden');
    hint.textContent = 'Make a wish!';
    setMessage('Candles are lit! Now press “Make a Wish”.', 'ready');
  });

  wishBtn.addEventListener('click', () => {
    if (!candlesLit || revealed) return;
    revealed = true;
    wishBtn.disabled = true;
    burstConfetti();
  launchFireworks();
    releaseBalloons();
  typeMessage(`Happy Birthday, ${TARGET_NAME}!`);
    replayBtn.classList.remove('hidden');
    try { playMelody(); } catch(e) { /* ignore */ }
  });

  replayBtn?.addEventListener('click', resetExperience);

  // personalization removed

  // Palette toggle
  paletteBtn?.addEventListener('click', () => {
    document.body.classList.toggle('palette-alt');
  });

  // Music control (simple mute flag influences playMelody)
  let musicEnabled = true;
  musicBtn?.addEventListener('click', () => {
    musicEnabled = !musicEnabled;
    musicBtn.textContent = musicEnabled ? '🎵' : '🔇';
    musicBtn.setAttribute('aria-label', musicEnabled ? 'Mute music' : 'Enable music');
  });

  function resetExperience() {
    candlesLit = false;
    revealed = false;
    candles.forEach(c => c.classList.remove('lit'));
    wishBtn.classList.add('hidden');
    lightBtn.classList.remove('hidden');
    wishBtn.disabled = false;
    replayBtn.classList.add('hidden');
    message.className = 'message';
    message.textContent = '';
  hint.textContent = 'Press Light Candles to start.';
    clearBalloons();
    setMessage('Tap “Light Candles” to begin the celebration.');
  }

  function setMessage(text, variant) {
    message.className = 'message' + (variant ? ' ' + variant : '');
    message.textContent = text;
  }

  function typeMessage(full) {
    message.className = 'message success';
    message.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'type-cursor';
    cursor.textContent = '|';
    message.appendChild(cursor);
    let i = 0;
    const interval = 48;
    const id = setInterval(() => {
      if (i < full.length) {
        cursor.before(full[i]);
        i++;
      } else {
        cursor.remove();
        clearInterval(id);
      }
    }, interval);
  }

  // Balloons
  const COLORS = ['#f43f5e','#fb7185','#f59e0b','#fbbf24','#6366f1','#ec4899'];
  function releaseBalloons() {
    const n = 10;
    for (let i=0;i<n;i++) {
      const el = document.createElement('div');
      el.className = 'balloon';
      const base = COLORS[i % COLORS.length];
      el.style.background = `linear-gradient(140deg, ${base}, ${shade(base,-25)})`;
      el.style.left = (10 + Math.random()*80) + '%';
      el.style.bottom = '-60px';
      const dur = 11 + Math.random()*6;
      el.style.animationDuration = dur + 's';
      el.style.animationDelay = (Math.random()*1.3) + 's';
      balloonsContainer.appendChild(el);
      setTimeout(() => el.remove(), (dur+2)*1000);
    }
  }
  function clearBalloons(){ balloonsContainer.innerHTML=''; }
  function shade(hex,percent){
    const num=parseInt(hex.slice(1),16), amt=Math.round(2.55*percent);
    const r=(num>>16)+amt, g=(num>>8&0x00FF)+amt, b=(num&0x0000FF)+amt;
    return '#'+(0x1000000 + (r<255?(r<0?0:r):255)*0x10000 + (g<255?(g<0?0:g):255)*0x100 + (b<255?(b<0?0:b):255)).toString(16).slice(1);
  }

  // Confetti implementation (simplified from React version)
  class ConfettiSystem {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.width = canvas.width = canvas.offsetWidth;
      this.height = canvas.height = canvas.offsetHeight;
      const resizeObserver = new ResizeObserver(() => this.resize());
      resizeObserver.observe(canvas);
      this._ro = resizeObserver;
      this.tick = this.tick.bind(this);
      requestAnimationFrame(this.tick);
    }
    resize() {
      this.width = this.canvas.width = this.canvas.offsetWidth;
      this.height = this.canvas.height = this.canvas.offsetHeight;
    }
    burst() {
      const COLORS = ['#FFFFFF', '#F43F5E', '#F59E0B'];
      const count = 130;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: this.width / 2 + (Math.random() - 0.5) * 40,
            y: this.height * 0.35 + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 6,
            vy: -Math.random() * 6 - 2,
            size: Math.random() * 6 + 4,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            life: 0,
            ttl: 200 + Math.random() * 60,
            rotation: Math.random() * 360,
            vr: (Math.random() - 0.5) * 12
        });
      }
    }
    tick() {
      const { ctx, width, height } = this;
      ctx.clearRect(0,0,width,height);
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.rotation += p.vr;
        p.life++;
        if (p.life > p.ttl || p.y > height + 20) {
          this.particles.splice(i,1);
          continue;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
        ctx.restore();
      }
      requestAnimationFrame(this.tick);
    }
    destroy() { this._ro.disconnect(); }
  }

  const confetti = new ConfettiSystem(confettiCanvas);
  function burstConfetti() { confetti.burst(); }

  // Fireworks (simple particle bursts separate from confetti canvas using DOM)
  function launchFireworks() {
    const bursts = 5;
    for (let i=0;i<bursts;i++) setTimeout(firework, i*300);
  }
  function firework() {
    const container = document.body;
    const fw = document.createElement('div');
    fw.className = 'firework';
    const x = 20 + Math.random()*60;
    const y = 25 + Math.random()*40;
    fw.style.left = x + 'vw';
    fw.style.top = y + 'vh';
    for (let i=0;i<18;i++) {
      const spark = document.createElement('span');
      spark.className = 'fw-spark';
      const angle = (i/18)*Math.PI*2;
      const dist = 40 + Math.random()*30;
      const tx = Math.cos(angle)*dist;
      const ty = Math.sin(angle)*dist;
      spark.style.setProperty('--tx', tx + 'px');
      spark.style.setProperty('--ty', ty + 'px');
      spark.style.background = `hsl(${Math.floor(Math.random()*360)} 90% 60%)`;
      fw.appendChild(spark);
    }
    container.appendChild(fw);
    setTimeout(()=>fw.remove(), 1800);
  }

  // Melody (Web Audio API) - same notes as original
  function playMelody() {
    if (!musicEnabled) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const notes = [
      [523.25, 0.18], // C5
      [659.25, 0.18], // E5
      [783.99, 0.18], // G5
      [1046.5, 0.26], // C6
      [880.0, 0.2],   // A5
      [987.77, 0.24], // B5
      [1046.5, 0.36], // C6
    ];
    let t = ctx.currentTime;
    notes.forEach(([freq,dur]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const attack = 0.01, release = 0.08;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + attack);
      gain.gain.setValueAtTime(0.25, t + dur);
      gain.gain.linearRampToValueAtTime(0, t + dur + release);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t + dur + release);
      t += dur + 0.03;
    });
    setTimeout(() => { if (ctx.close) ctx.close(); }, 2500);
  }
})();
