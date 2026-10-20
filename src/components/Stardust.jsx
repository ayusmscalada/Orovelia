import { useEffect, useRef } from 'react';
import { whenIdle } from '../utils/idle.js';

// Drifting golden particles that gently connect when near each other.
// Starts after first paint, pauses off-screen / in background tabs, and scales down on small screens.
export default function Stardust() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w, h, particles, raf = 0, running = false, visible = false;
    // Adaptive quality: if the device can't keep ~45fps, drop to 30fps without link lines.
    let lowPower = false, sampleFrames = 0, sampleStart = 0, lastDrawn = 0;
    const mouse = { x: -9999, y: -9999 };
    const LINK = 110;

    const init = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * (lowPower ? 0.6 : 1);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(w < 700 ? 34 : 70, Math.floor((w * h) / 16000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.3,
        color: Math.random() < 0.8 ? 'rgba(255, 214, 140, 0.85)' : 'rgba(196, 160, 255, 0.85)',
      }));
    };

    const draw = (time = 0) => {
      if (lowPower && running && time - lastDrawn < 30) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastDrawn = time;
      if (running && !lowPower && sampleFrames < 60) {
        if (sampleFrames === 0) sampleStart = time;
        if (++sampleFrames === 60 && (time - sampleStart) / 59 > 22) {
          lowPower = true;
          init();
        }
      }

      ctx.clearRect(0, 0, w, h);
      // Links first, batched into a few strokes by strength instead of one stroke per pair.
      const buckets = [[], [], []];
      for (let i = 0; i < particles.length && !lowPower; i++) {
        const p = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) buckets[Math.min(2, Math.floor((Math.sqrt(d2) / LINK) * 3))].push(p.x, p.y, q.x, q.y);
        }
      }
      ctx.lineWidth = 0.6;
      buckets.forEach((seg, b) => {
        if (!seg.length) return;
        ctx.strokeStyle = `rgba(255, 214, 140, ${0.12 * (1 - b / 3)})`;
        ctx.beginPath();
        for (let k = 0; k < seg.length; k += 4) {
          ctx.moveTo(seg[k], seg[k + 1]);
          ctx.lineTo(seg[k + 2], seg[k + 3]);
        }
        ctx.stroke();
      });

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const md = Math.hypot(dx, dy);
        if (md > 0 && md < 120) {
          p.x += (dx / md) * 0.8;
          p.y += (dy / md) * 0.8;
        }
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      canvas.classList.add('is-ready'); // fade in on the first real frame
      if (running) raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running || reduced || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    let io, ro;
    const cancelIdle = whenIdle(() => {
      init();
      if (reduced) draw();
      ro = new ResizeObserver(() => {
        init();
        if (reduced) draw();
      });
      ro.observe(canvas);
      io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        visible ? start() : stop();
      });
      io.observe(canvas);
    });

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelIdle();
      stop();
      io?.disconnect();
      ro?.disconnect();
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="stardust" aria-hidden="true" />;
}
