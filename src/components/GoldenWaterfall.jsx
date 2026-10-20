import { useEffect, useRef } from 'react';
import { whenIdle } from '../utils/idle.js';

// Animated golden waterfall: a river of light slides over a cliff lip between two rock faces,
// falls as a glowing curtain into a misty pool, with droplets, spray, rising mist and ripples.
// Starts after first paint, pauses off-screen / in background tabs, drops to 30fps with fewer
// particles on slow devices, and draws a still frame for reduced motion.
export default function GoldenWaterfall({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = 0, H = 0;
    let cx, halfW, ledgeY, poolY, fallH;
    let streams = [], drops = [], spray = [], mist = [], ripples = [], sparkles = [];
    let rockL = [], rockR = [], rockTopL = [], rockTopR = [];
    let grads = {}, mistSprite, edgeMask;
    let raf = 0, running = false, last = 0, t = 0, rippleTimer = 0;
    // Adaptive quality: measured over the first frames, then fixed.
    let lowPower = false, sampleFrames = 0, sampleStart = 0, lastDrawn = 0;

    const rand = (a, b) => a + Math.random() * (b - a);
    const EDGE_STEPS = 18;

    // Half-width of the falling curtain at progress p (0 = lip, 1 = pool): it fans out as it falls.
    const spreadAt = (p) => halfW * (1 + 0.3 * Math.pow(p, 1.5));
    const xAt = (s, p) => cx + s.u * spreadAt(p) + Math.sin(t * 0.9 + s.phase) * 2.4 * p;

    function setup() {
      // A soft, glowing effect doesn't need full retina resolution — and on slow devices
      // it renders at 60% and is scaled up by CSS, which is visually identical for glow.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * (lowPower ? 0.6 : 1);
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cx = W * 0.56;
      halfW = Math.max(54, W * 0.15);
      ledgeY = H * 0.2;
      poolY = H * 0.82;
      fallH = poolY - ledgeY;

      streams = Array.from({ length: 46 }, (_, i) => {
        const r = (i / 45) * 2 - 1;
        return {
          u: Math.sign(r) * Math.pow(Math.abs(r), 0.8),
          width: rand(0.7, 2.6),
          speed: rand(170, 300),
          dash: rand(60, 160),
          gap: rand(20, 70),
          offset: rand(0, 500),
          alpha: rand(0.3, 0.85),
          phase: rand(0, Math.PI * 2),
        };
      });

      // Jagged rock faces either side of the falls, generated once per size.
      const edge = (dir) =>
        Array.from({ length: EDGE_STEPS + 1 }, (_, k) => {
          const p = k / EDGE_STEPS;
          return [cx + dir * (spreadAt(p) + 4 + Math.random() * 10 + p * 6), ledgeY + p * (fallH + 24)];
        });
      rockL = edge(-1);
      rockR = edge(1);
      // Jagged cliff tops stepping down away from the lip.
      const top = (dir) =>
        Array.from({ length: 7 }, (_, k) => {
          const q = k / 6;
          return [cx + dir * (halfW * 1.05 + q * halfW * 1.6), ledgeY - 10 + q * q * 70 + (k % 2 ? -8 : 6) * (1 - q)];
        });
      rockTopL = top(-1);
      rockTopR = top(1);

      drops = Array.from({ length: Math.round(W / 5) }, () => newDrop(true));
      spray = [];
      ripples = [];
      mist = Array.from({ length: 16 }, () => newMist(true));
      sparkles = Array.from({ length: 22 }, newSparkle);

      buildGradients();
    }

    function buildGradients() {
      const g = {};
      g.backdrop = ctx.createRadialGradient(cx, ledgeY + fallH * 0.6, 10, cx, ledgeY + fallH * 0.6, halfW * 3.6);
      g.backdrop.addColorStop(0, 'rgba(240, 178, 74, 0.26)');
      g.backdrop.addColorStop(0.45, 'rgba(155, 107, 255, 0.08)');
      g.backdrop.addColorStop(1, 'rgba(0, 0, 0, 0)');

      g.curtain = ctx.createLinearGradient(0, ledgeY, 0, poolY);
      g.curtain.addColorStop(0, 'rgba(255, 238, 195, 0.55)');
      g.curtain.addColorStop(0.25, 'rgba(250, 200, 110, 0.32)');
      g.curtain.addColorStop(0.7, 'rgba(235, 160, 70, 0.16)');
      g.curtain.addColorStop(1, 'rgba(220, 130, 50, 0.04)');

      g.ribbon = ctx.createLinearGradient(0, ledgeY, 0, poolY + 10);
      g.ribbon.addColorStop(0, 'rgba(255, 250, 230, 1)');
      g.ribbon.addColorStop(0.3, 'rgba(255, 220, 150, 0.95)');
      g.ribbon.addColorStop(0.75, 'rgba(242, 165, 75, 0.55)');
      g.ribbon.addColorStop(1, 'rgba(225, 125, 50, 0)');

      g.river = ctx.createLinearGradient(0, ledgeY - H * 0.16, 0, ledgeY);
      g.river.addColorStop(0, 'rgba(255, 227, 163, 0)');
      g.river.addColorStop(1, 'rgba(255, 232, 180, 0.42)');

      // Rock fades out away from the water so it never shows a hard outer edge.
      const rock = (from, to) => {
        const r = ctx.createLinearGradient(from, 0, to, 0);
        r.addColorStop(0, 'rgba(26, 19, 34, 1)');
        r.addColorStop(0.55, 'rgba(18, 13, 26, 0.75)');
        r.addColorStop(1, 'rgba(10, 8, 16, 0)');
        return r;
      };
      g.rockL = rock(cx - halfW * 1.1, cx - halfW * 2.8);
      g.rockR = rock(cx + halfW * 1.1, cx + halfW * 2.8);

      g.riverSheet = ctx.createLinearGradient(0, ledgeY - H * 0.16, 0, ledgeY);
      g.riverSheet.addColorStop(0, 'rgba(255, 220, 150, 0)');
      g.riverSheet.addColorStop(1, 'rgba(255, 225, 160, 0.22)');

      g.lip = ctx.createLinearGradient(cx - halfW * 1.1, 0, cx + halfW * 1.1, 0);
      g.lip.addColorStop(0, 'rgba(255, 227, 163, 0)');
      g.lip.addColorStop(0.5, 'rgba(255, 248, 225, 1)');
      g.lip.addColorStop(1, 'rgba(255, 227, 163, 0)');

      g.pool = ctx.createRadialGradient(cx, poolY + 14, 0, cx, poolY + 14, halfW * 2);
      g.pool.addColorStop(0, 'rgba(255, 220, 150, 0.4)');
      g.pool.addColorStop(0.5, 'rgba(240, 178, 74, 0.12)');
      g.pool.addColorStop(1, 'rgba(240, 178, 74, 0)');
      grads = g;

      // Soft round puff, stamped (scaled) for each mist cloud.
      mistSprite = document.createElement('canvas');
      mistSprite.width = mistSprite.height = 128;
      const m = mistSprite.getContext('2d');
      const mg = m.createRadialGradient(64, 64, 0, 64, 64, 64);
      mg.addColorStop(0, 'rgba(255, 232, 185, 1)');
      mg.addColorStop(0.5, 'rgba(255, 220, 160, 0.35)');
      mg.addColorStop(1, 'rgba(255, 220, 160, 0)');
      m.fillStyle = mg;
      m.fillRect(0, 0, 128, 128);

      // Fade every edge into the page. Applied inside the canvas each frame — far cheaper than a
      // CSS mask on an element that repaints 60 times a second.
      edgeMask = document.createElement('canvas');
      edgeMask.width = W;
      edgeMask.height = H;
      const e = edgeMask.getContext('2d');
      const hz = e.createLinearGradient(0, 0, W, 0);
      hz.addColorStop(0, 'rgba(0,0,0,0)');
      hz.addColorStop(0.16, '#000');
      hz.addColorStop(0.86, '#000');
      hz.addColorStop(1, 'rgba(0,0,0,0)');
      e.fillStyle = hz;
      e.fillRect(0, 0, W, H);
      e.globalCompositeOperation = 'destination-in';
      const vt = e.createLinearGradient(0, 0, 0, H);
      vt.addColorStop(0, 'rgba(0,0,0,0)');
      vt.addColorStop(0.1, '#000');
      vt.addColorStop(0.84, '#000');
      vt.addColorStop(1, 'rgba(0,0,0,0)');
      e.fillStyle = vt;
      e.fillRect(0, 0, W, H);
    }

    function newDrop(anywhere = false) {
      const s = streams[(Math.random() * streams.length) | 0];
      return { s, p: anywhere ? Math.random() : 0, v: rand(1.5, 3), len: rand(8, 22), size: rand(0.6, 1.6) };
    }

    function newMist(anywhere = false) {
      return {
        x: cx + rand(-1.3, 1.3) * halfW,
        y: poolY + rand(-10, 16),
        r: rand(0.5, 1.1) * halfW,
        vx: rand(-8, 8),
        vy: rand(-18, -6),
        life: anywhere ? Math.random() : 0,
        speed: rand(0.12, 0.25),
      };
    }

    function newSparkle() {
      return { x: cx + rand(-1.5, 1.5) * halfW, y: poolY + rand(-80, 10), life: Math.random(), speed: rand(0.25, 0.6), size: rand(0.6, 1.6) };
    }

    function drawRocks() {
      for (const [points, tops, fill] of [[rockL, rockTopL, grads.rockL], [rockR, rockTopR, grads.rockR]]) {
        const outerX = tops[tops.length - 1][0];
        ctx.beginPath();
        tops.slice().reverse().forEach(([x, y], k) => (k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
        points.forEach(([x, y], k) => ctx.lineTo(x, k === 0 ? y - 6 : y));
        ctx.lineTo(outerX, poolY + 30);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();

        // Faint rim along the cliff top.
        ctx.beginPath();
        tops.forEach(([x, y], k) => (k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'rgba(255, 220, 150, 0.14)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';

        // Gold rim light where the rock meets the water.
        ctx.beginPath();
        points.forEach(([x, y], k) => (k === 0 ? ctx.moveTo(x, y - 6) : ctx.lineTo(x, y)));
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'rgba(240, 178, 74, 0.12)';
        ctx.lineWidth = 8;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 220, 150, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    function drawRiver() {
      // The river sliding toward the lip, narrowing into the distance.
      const top = ledgeY - H * 0.16;
      ctx.fillStyle = grads.riverSheet;
      ctx.beginPath();
      ctx.moveTo(cx - halfW * 0.55, top);
      ctx.lineTo(cx + halfW * 0.55, top);
      ctx.lineTo(cx + halfW * 1.05, ledgeY);
      ctx.lineTo(cx - halfW * 1.05, ledgeY);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = grads.river;
      ctx.setLineDash([14, 18]);
      for (let i = 0; i < 26; i++) {
        const u = (i / 25) * 2 - 1;
        ctx.lineDashOffset = -(t * 46 + i * 9);
        ctx.beginPath();
        ctx.moveTo(cx + u * halfW * 0.55, top);
        ctx.lineTo(cx + u * halfW * 1.02, ledgeY);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    function drawCurtain() {
      // Continuous body of water between the outermost streams.
      ctx.beginPath();
      for (let k = 0; k <= EDGE_STEPS; k++) {
        const p = k / EDGE_STEPS;
        ctx.lineTo(cx - spreadAt(p), ledgeY + p * fallH);
      }
      for (let k = EDGE_STEPS; k >= 0; k--) {
        const p = k / EDGE_STEPS;
        ctx.lineTo(cx + spreadAt(p), ledgeY + p * fallH);
      }
      ctx.closePath();
      ctx.fillStyle = grads.curtain;
      ctx.fill();
    }

    function drawStreams() {
      const steps = 12;
      ctx.lineCap = 'round';
      ctx.strokeStyle = grads.ribbon;
      for (const s of streams) {
        ctx.beginPath();
        for (let k = 0; k <= steps; k++) {
          const p = k / steps;
          const x = xAt(s, p);
          const y = ledgeY + p * fallH;
          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.setLineDash([s.dash, s.gap]);
        ctx.lineDashOffset = -(t * s.speed + s.offset);
        ctx.lineWidth = s.width;
        ctx.globalAlpha = s.alpha;
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    function drawLip() {
      ctx.strokeStyle = 'rgba(240, 178, 74, 0.3)';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(cx - halfW * 1.05, ledgeY);
      ctx.quadraticCurveTo(cx, ledgeY + 5, cx + halfW * 1.05, ledgeY);
      ctx.stroke();
      ctx.strokeStyle = grads.lip;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    function drawDrops(dt) {
      ctx.lineCap = 'round';
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        d.v += 6 * dt; // gravity (px per frame, per second)
        d.p += (d.v * dt * 60) / fallH;
        if (d.p >= 1) {
          const x = xAt(d.s, 1);
          for (let k = 0; k < 2; k++) {
            spray.push({ x, y: poolY, vx: rand(-1.6, 1.6), vy: rand(-3.4, -1.2), life: 1, size: rand(0.6, 1.7) });
          }
          drops[i] = newDrop();
          continue;
        }
        const y = ledgeY + d.p * fallH;
        const x = xAt(d.s, d.p);
        const a = Math.min(1, d.p * 3) * (1 - d.p * 0.5);
        ctx.strokeStyle = `rgba(255, 240, 205, ${0.7 * a})`;
        ctx.lineWidth = d.size;
        ctx.beginPath();
        ctx.moveTo(x, y - d.len * (0.4 + d.p));
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }

    function drawSpray(dt) {
      for (let i = spray.length - 1; i >= 0; i--) {
        const s = spray[i];
        s.vy += 9 * dt; // gravity pulls the spray back down
        s.x += s.vx * dt * 30;
        s.y += s.vy * dt * 30;
        s.life -= dt * 1.3;
        if (s.life <= 0 || s.y > poolY + 8) {
          spray.splice(i, 1);
          continue;
        }
        ctx.fillStyle = `rgba(255, 232, 185, ${s.life * 0.8})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, Math.max(0.1, s.size), 0, Math.PI * 2);
        ctx.fill();
      }
      if (spray.length > 500) spray.splice(0, spray.length - 500);
    }

    function drawMist(dt) {
      for (let i = 0; i < mist.length; i++) {
        const m = mist[i];
        m.life += dt * m.speed;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        if (m.life >= 1) {
          mist[i] = newMist();
          continue;
        }
        const r = m.r * (0.7 + m.life * 0.8);
        ctx.globalAlpha = Math.sin(m.life * Math.PI) * 0.22;
        ctx.drawImage(mistSprite, m.x - r, m.y - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;
    }

    function drawPool(dt) {
      ctx.fillStyle = grads.pool;
      ctx.beginPath();
      ctx.ellipse(cx, poolY + 14, halfW * 2, 34, 0, 0, Math.PI * 2);
      ctx.fill();

      rippleTimer -= dt;
      if (rippleTimer <= 0) {
        ripples.push({ x: cx + rand(-0.7, 0.7) * halfW, r: rand(6, 14), life: 1 });
        rippleTimer = rand(0.2, 0.45);
      }
      ctx.lineWidth = 1;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += dt * 48;
        rp.life -= dt * 0.6;
        if (rp.life <= 0) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(255, 227, 163, ${rp.life * 0.4})`;
        ctx.beginPath();
        ctx.ellipse(rp.x, poolY + 14, rp.r, rp.r * 0.18, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    function drawSparkles(dt) {
      for (let i = 0; i < sparkles.length; i++) {
        const s = sparkles[i];
        s.life += dt * s.speed;
        s.y -= dt * 14 * s.speed;
        if (s.life >= 1) {
          sparkles[i] = { ...newSparkle(), life: 0 };
          continue;
        }
        const a = Math.sin(s.life * Math.PI);
        ctx.fillStyle = `rgba(255, 246, 222, ${a * 0.9})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, Math.max(0.1, s.size * a + 0.2), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function frame(time) {
      // On slow devices, draw every other frame (~30fps).
      if (lowPower && running && time - lastDrawn < 30) {
        raf = requestAnimationFrame(frame);
        return;
      }
      lastDrawn = time;
      const dt = last ? Math.min(0.05, Math.max(0, (time - last) / 1000)) : 1 / 60;
      last = time;
      t += dt;

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = grads.backdrop;
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'lighter';
      drawRiver();
      drawCurtain();
      drawStreams();
      drawDrops(dt);
      ctx.globalCompositeOperation = 'source-over';
      drawRocks();
      ctx.globalCompositeOperation = 'lighter';
      drawLip();
      drawPool(dt);
      drawMist(dt);
      drawSpray(dt);
      drawSparkles(dt);
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(edgeMask, 0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';

      if (running && !lowPower && sampleFrames < 60) {
        if (sampleFrames === 0) sampleStart = time;
        if (++sampleFrames === 60 && (time - sampleStart) / 59 > 22) {
          // The device can't hold ~45fps (slow CPU, no GPU, battery saver): lighten the scene.
          lowPower = true;
          setup();
          drops.length = Math.ceil(drops.length / 2);
          streams = streams.filter((_, i) => i % 3 !== 0);
          mist.length = 10;
        }
      }
      canvas.classList.add('is-ready'); // fade in on the first real frame
      if (running) raf = requestAnimationFrame(frame);
    }

    const start = () => {
      if (running || reduced) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const still = () => {
      // Advance the simulation a little so the still frame has spray and mist in it.
      last = 0;
      for (let i = 0; i < 90; i++) frame(i * 16);
    };

    let ro, io, visible = false;
    const onVisibility = () => (document.hidden ? stop() : visible && start());

    // Wait until the page has painted so the hero text and search appear first.
    const cancelIdle = whenIdle(() => {
      setup();
      if (reduced) still();
      ro = new ResizeObserver(() => {
        setup();
        if (lowPower) {
          drops.length = Math.ceil(drops.length / 2);
          streams = streams.filter((_, i) => i % 3 !== 0);
        }
        if (reduced) still();
      });
      ro.observe(canvas);
      io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        visible && !document.hidden ? start() : stop();
      });
      io.observe(canvas);
      document.addEventListener('visibilitychange', onVisibility);
    });

    return () => {
      cancelIdle();
      stop();
      ro?.disconnect();
      io?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className={`waterfall ${className}`} aria-hidden="true" />;
}
