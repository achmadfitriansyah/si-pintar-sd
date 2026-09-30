let ctx;
/** Bunyi pendek: ok=true nada naik (berhasil), ok=false nada rendah (gagal). Diam-diam gagal bila browser melarang. */
export function beep(ok = true) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = ctx || new AC();
    if (ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;
    const notes = ok ? [[880, 0], [1320, 0.09]] : [[220, 0], [165, 0.14]];
    for (const [f, d] of notes) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = ok ? "sine" : "square";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t + d);
      g.gain.exponentialRampToValueAtTime(ok ? 0.25 : 0.12, t + d + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d + (ok ? 0.12 : 0.18));
      o.connect(g).connect(ctx.destination);
      o.start(t + d);
      o.stop(t + d + 0.2);
    }
  } catch {}
}
