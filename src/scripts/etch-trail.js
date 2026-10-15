// The pointer etches a crisp pixel version of the section's photo through the blur.
// Cells under the brush reveal instantly and let go a few hundred ms after it passes.
// Mount on any <canvas class="etch-trail" data-src="..."> placed directly inside its section.
// Optional: data-flip mirrors the photo vertically, data-tint sets the darkening alpha,
// data-shield lists selectors whose boxes the trail should only faintly cross (text),
// data-surface names the descendant that receives pointer input (defaults to the parent),
// data-dim-bottom darkens the lower part of the reveal to match a backdrop gradient.
const CELL = 4;
const BRUSH_RADIUS = 85;
const EDGE_NOISE = 22;
const SHIELD_PAD = 16;
const SHIELD_FEATHER = 56;
const SHIELD_ALPHA = 0.22;
const EDGE_FEATHER = 180;
const motion = matchMedia('(prefers-reduced-motion: reduce)');

const hash = (x, y) => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
};
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const coverFit = (sw, sh, dw, dh) => {
  const scale = Math.max(dw / sw, dh / sh);
  const w = dw / scale, h = dh / scale;
  return {x: (sw - w) / 2, y: (sh - h) / 2, w, h};
};
const distanceToRect = (x, y, rect) => {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.hypot(dx, dy);
};

const mount = canvas => {
  const section = canvas.parentElement;
  const context = canvas.getContext('2d');
  const src = canvas.dataset.src;
  if (!section || !context || !src) return;
  const flip = canvas.hasAttribute('data-flip');
  const tint = Number.parseFloat(canvas.dataset.tint ?? '0.18');
  const shieldSelector = canvas.dataset.shield ?? '';
  const dimBottom = Number.parseFloat(canvas.dataset.dimBottom ?? '0');
  const surface = (canvas.dataset.surface && section.querySelector(canvas.dataset.surface)) || section;
  const image = new Image();
  const source = document.createElement('canvas');
  const mask = document.createElement('canvas');
  const sourceContext = source.getContext('2d');
  const maskContext = mask.getContext('2d');
  let cols = 0, rows = 0, width = 0, height = 0, rowMin = 0, rowMax = 0;
  let revealed = new Uint8Array(0), expiresAt = new Float64Array(0);
  let noise = new Float32Array(0), shield = new Float32Array(0);
  let revealedCount = 0, drawFrame = 0, expireFrame = 0, resizeFrame = 0, settle = 0, strength = 0;
  let visible = false, last = null;
  let active = new Set();
  const pending = new Set();

  const render = () => {
    drawFrame = 0;
    context.clearRect(0, 0, width, height);
    if (!revealedCount) return;
    context.imageSmoothingEnabled = false;
    context.drawImage(source, 0, 0, cols, rows, 0, 0, width, height);
    context.globalCompositeOperation = 'destination-in';
    context.drawImage(mask, 0, 0);
    context.globalCompositeOperation = 'source-over';
  };
  const scheduleRender = () => {
    if (!drawFrame) drawFrame = requestAnimationFrame(render);
  };

  const setRevealed = (index, on) => {
    const next = on ? 1 : 0;
    if (revealed[index] === next) return;
    revealed[index] = next;
    revealedCount += on ? 1 : -1;
    const x = (index % cols) * CELL, y = Math.floor(index / cols) * CELL;
    if (on) {
      maskContext.fillStyle = `rgba(255, 255, 255, ${shield[index]})`;
      maskContext.fillRect(x, y, CELL, CELL);
    } else {
      maskContext.clearRect(x, y, CELL, CELL);
    }
    scheduleRender();
  };

  const expireLoop = () => {
    expireFrame = 0;
    const now = performance.now();
    for (const index of pending) {
      if (active.has(index)) {
        pending.delete(index);
        continue;
      }
      if (expiresAt[index] <= now) {
        pending.delete(index);
        setRevealed(index, false);
      }
    }
    if (pending.size) expireFrame = requestAnimationFrame(expireLoop);
  };
  const release = index => {
    expiresAt[index] = performance.now() + 80 + 340 * Math.random();
    pending.add(index);
    if (!expireFrame) expireFrame = requestAnimationFrame(expireLoop);
  };
  const releaseAll = () => {
    for (const index of active) release(index);
    active = new Set();
  };

  const brush = (x, y, radius) => {
    const next = new Set();
    if (radius < 1 || !cols) return next;
    const reach = radius + EDGE_NOISE;
    const c0 = Math.max(0, Math.floor((x - reach) / CELL));
    const c1 = Math.min(cols - 1, Math.ceil((x + reach) / CELL));
    const r0 = Math.max(rowMin, Math.floor((y - reach) / CELL));
    const r1 = Math.min(rowMax, Math.ceil((y + reach) / CELL));
    for (let r = r0; r <= r1; r++) {
      const dy = r * CELL + CELL / 2 - y;
      for (let c = c0; c <= c1; c++) {
        const index = r * cols + c;
        const size = radius + noise[index];
        if (size <= 0) continue;
        const dx = c * CELL + CELL / 2 - x;
        if (dx * dx + dy * dy < size * size) next.add(index);
      }
    }
    return next;
  };
  const apply = next => {
    for (const index of next) {
      if (active.has(index)) continue;
      expiresAt[index] = 0;
      pending.delete(index);
      setRevealed(index, true);
    }
    for (const index of active) if (!next.has(index)) release(index);
    active = next;
  };

  const move = event => {
    if (event.pointerType === 'touch' || !cols || !visible || motion.matches) return;
    const rect = canvas.getBoundingClientRect();
    const x = clamp(event.clientX - rect.left, 0, rect.width) * (width / rect.width);
    const y = clamp(event.clientY - rect.top, 0, rect.height) * (height / rect.height);
    const now = performance.now();
    const speed = last ? Math.hypot(event.clientX - last.x, event.clientY - last.y) / Math.max(1, now - last.t) : 0;
    last = {x: event.clientX, y: event.clientY, t: now};
    strength = Math.min(1, Math.max(strength, 0.2) + 0.42 * Math.min(1, speed / 2.5));
    apply(brush(x, y, BRUSH_RADIUS * strength));
    clearTimeout(settle);
    settle = setTimeout(() => {
      strength = 0;
      releaseAll();
    }, 40);
  };
  const leave = () => {
    clearTimeout(settle);
    strength = 0;
    last = null;
    releaseAll();
  };
  const reset = () => {
    leave();
    for (const index of pending) setRevealed(index, false);
    pending.clear();
    context.clearRect(0, 0, width, height);
  };

  const shieldRects = bounds => {
    if (!shieldSelector) return [];
    return [...section.querySelectorAll(shieldSelector)].map(element => {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left - bounds.left - SHIELD_PAD,
        top: rect.top - bounds.top - SHIELD_PAD,
        right: rect.right - bounds.left + SHIELD_PAD,
        bottom: rect.bottom - bounds.top + SHIELD_PAD,
      };
    });
  };
  const shieldAlpha = (x, y, rects) => {
    let alpha = 1;
    for (const rect of rects) {
      const t = clamp(distanceToRect(x, y, rect) / SHIELD_FEATHER, 0, 1);
      alpha = Math.min(alpha, SHIELD_ALPHA + (1 - SHIELD_ALPHA) * t);
    }
    return alpha;
  };

  const build = () => {
    if (!image.naturalWidth) return;
    const bounds = section.getBoundingClientRect();
    if (bounds.width < 1 || bounds.height < 1) return;
    cols = Math.ceil(bounds.width / CELL);
    rows = Math.ceil(bounds.height / CELL);
    width = cols * CELL;
    height = rows * CELL;
    canvas.width = mask.width = width;
    canvas.height = mask.height = height;
    source.width = cols;
    source.height = rows;
    const fit = coverFit(image.naturalWidth, image.naturalHeight, cols, rows);
    sourceContext.imageSmoothingEnabled = true;
    if (flip) sourceContext.setTransform(1, 0, 0, -1, 0, rows);
    sourceContext.drawImage(image, fit.x, fit.y, fit.w, fit.h, 0, 0, cols, rows);
    sourceContext.setTransform(1, 0, 0, 1, 0, 0);
    if (tint > 0) {
      sourceContext.globalCompositeOperation = 'source-atop';
      sourceContext.fillStyle = `rgba(13, 32, 25, ${tint})`;
      sourceContext.fillRect(0, 0, cols, rows);
      sourceContext.globalCompositeOperation = 'source-over';
    }
    if (dimBottom > 0) {
      const dim = sourceContext.createLinearGradient(0, rows * 0.55, 0, rows);
      dim.addColorStop(0, 'rgba(13, 32, 25, 0)');
      dim.addColorStop(1, `rgba(13, 32, 25, ${dimBottom})`);
      sourceContext.globalCompositeOperation = 'source-atop';
      sourceContext.fillStyle = dim;
      sourceContext.fillRect(0, 0, cols, rows);
      sourceContext.globalCompositeOperation = 'source-over';
    }
    const count = cols * rows;
    const rects = shieldRects(bounds);
    const area = surface.getBoundingClientRect();
    const areaTop = area.top - bounds.top, areaBottom = area.bottom - bounds.top;
    rowMin = Math.max(0, Math.floor(areaTop / CELL));
    rowMax = Math.min(rows - 1, Math.floor(areaBottom / CELL) - 1);
    const bounded = surface !== section;
    revealed = new Uint8Array(count);
    expiresAt = new Float64Array(count);
    noise = new Float32Array(count);
    shield = new Float32Array(count);
    for (let r = 0; r < rows; r++) {
      const cy = r * CELL + CELL / 2;
      for (let c = 0; c < cols; c++) {
        const index = r * cols + c;
        noise[index] = EDGE_NOISE * hash(c * 0.5, r * 0.5);
        let alpha = rects.length ? shieldAlpha(c * CELL + CELL / 2, cy, rects) : 1;
        if (bounded) alpha *= clamp(Math.min(areaBottom - cy, cy - areaTop) / EDGE_FEATHER, 0, 1) ** 2;
        shield[index] = alpha;
      }
    }
    revealedCount = 0;
    active = new Set();
    pending.clear();
    maskContext.clearRect(0, 0, width, height);
    context.clearRect(0, 0, width, height);
  };

  image.addEventListener('load', build);
  image.src = src;
  new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(build);
  }).observe(section);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) reset();
  }, {threshold: 0.1}).observe(section);
  surface.addEventListener('pointermove', move, {passive: true});
  surface.addEventListener('pointerleave', leave);
  surface.addEventListener('pointercancel', leave);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
  motion.addEventListener('change', () => { if (motion.matches) reset(); });
};

document.querySelectorAll('canvas.etch-trail').forEach(mount);
