// Share My Sukkah — renders a 1080×1920 WhatsApp Status card on a <canvas>.
// Three designed templates (Bold / Clean / Photo). Everything is drawn from the
// real sukkah photo, the real short link and a real QR code, so the result is a
// genuine high-res JPG, not a screenshot.

import qrcode from 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/+esm';

export const W = 1080, H = 1920;
const INK = '#0b0b0b', LIME = '#d8f23a', MUTE = '#6f6f69', WHITE = '#ffffff';

export const TEMPLATES = [
  { id: 'bold', name: { en: 'Bold', yi: 'שטארק' } },
  { id: 'clean', name: { en: 'Clean', yi: 'ריין' } },
  { id: 'photo', name: { en: 'Photo', yi: 'בילד' } },
];

/** Default wording. Admin can override headline / vote / button per language (settings.share.copy). */
export const COPY = {
  en: {
    headline: 'Come see my sukkah.', vote: 'Vote for my sukkah', button: 'View + Vote',
    headlineV: 'Look at this sukkah.', voteV: 'Vote for it on SukkahPin',
    now: 'NOW ON SUKKAHPIN', scan: 'Scan to vote', votes: (n) => `♥ ${n} ${n === 1 ? 'vote' : 'votes'}`,
    year: (y) => `SUKKOS ${y}`,
    presets: ['Come see my sukkah.', 'My sukkah is on SukkahPin.', 'Vote for my sukkah.'],
    presetsV: ['Look at this sukkah.', 'Have you seen this sukkah?', 'Vote for this sukkah.'],
  },
  yi: {
    headline: 'קומט זען מיין סוכה.', vote: 'גיבט א שטימע פאר מיין סוכה', button: 'קוקט און שטימט',
    headlineV: 'קוקט אויף די סוכה.', voteV: 'גיבט א שטימע אויף SukkahPin',
    now: 'יעצט אויף SukkahPin', scan: 'סקענט און שטימט', votes: (n) => `${n} שטימען ♥`,
    year: (y) => `סוכות ${hebrewYear(y)}`,
    presets: ['קומט זען מיין סוכה.', 'מיין סוכה איז יעצט אויף SukkahPin.', 'גיבט א שטימע פאר מיין סוכה.'],
    presetsV: ['קוקט אויף די סוכה.', 'האט איר שוין געזען די סוכה?', 'גיבט א שטימע פאר די סוכה.'],
  },
};

/** 2026 → תשפ״ז (Sukkos falls after Rosh Hashanah, so Gregorian + 3761). */
export function hebrewYear(g) {
  let n = (g + 3761) % 1000;
  const L = [[400, 'ת'], [300, 'ש'], [200, 'ר'], [100, 'ק'], [90, 'צ'], [80, 'פ'], [70, 'ע'], [60, 'ס'], [50, 'נ'], [40, 'מ'], [30, 'ל'], [20, 'כ'], [10, 'י'], [9, 'ט'], [8, 'ח'], [7, 'ז'], [6, 'ו'], [5, 'ה'], [4, 'ד'], [3, 'ג'], [2, 'ב'], [1, 'א']];
  let out = '';
  while (n > 0) {
    if (n % 100 === 15) { out += 'טו'; n -= 15; continue; }
    if (n % 100 === 16) { out += 'טז'; n -= 16; continue; }
    const [v, ch] = L.find(([v]) => v <= n);
    out += ch; n -= v;
  }
  return out.length > 1 ? `${out.slice(0, -1)}״${out.slice(-1)}` : `${out}׳`;
}

/* ---------------- Assets ---------------- */

const cache = new Map();
export function loadImage(src) {
  if (!cache.has(src)) {
    cache.set(src, new Promise((res, rej) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Supabase Storage sends CORS headers, so the canvas stays exportable
      img.decoding = 'async';
      img.onload = () => res(img);
      img.onerror = () => { cache.delete(src); rej(new Error('image failed: ' + src)); };
      img.src = src;
    }));
  }
  return cache.get(src);
}

export async function ensureFonts() {
  if (!document.fonts?.load) return;
  await Promise.all(['800 120px "Inter Tight"', '700 40px "Inter Tight"', '500 40px "Inter Tight"', '800 120px "Heebo"', '700 40px "Heebo"', '500 40px "Heebo"']
    .map((f) => document.fonts.load(f).catch(() => {})));
}

/** Plain black-on-white QR (high contrast = reliable scans), with a quiet zone. */
export function makeQR(text, size = 480) {
  const q = qrcode(0, 'M');
  q.addData(text);
  q.make();
  const n = q.getModuleCount(), quiet = 2, cell = Math.max(2, Math.floor(size / (n + quiet * 2)));
  const c = document.createElement('canvas');
  c.width = c.height = cell * (n + quiet * 2);
  const x = c.getContext('2d');
  x.fillStyle = WHITE; x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = INK;
  for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) x.fillRect((k + quiet) * cell, (r + quiet) * cell, cell, cell);
  return c;
}

/* ---------------- Drawing helpers ---------------- */

/** Wrap a piece of text in a Unicode bidi isolate so English and Yiddish don't scramble each other. */
const iso = (x) => `\u2068${x}\u2069`;
const metaLine = (d) => [d.showLoc && d.location, d.showVotes && d.votes > 0 && COPY[d.lang].votes(d.votes)].filter(Boolean).map(iso).join('  ·  ');

const fam = (lang) => (lang === 'yi' ? '"Heebo", "Inter Tight", Arial, sans-serif' : '"Inter Tight", "Helvetica Neue", Arial, sans-serif');
const setFont = (ctx, w, s, lang, track = 0) => {
  ctx.font = `${w} ${s}px ${fam(lang)}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${track}px`;
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** Cover-fit an image into a rect with zoom + focal point (0..1). Returns the pixel scale used. */
export function drawCover(ctx, img, x, y, w, h, crop = {}) {
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const zoom = clamp(crop.zoom || 1, 1, 3);
  const s = Math.max(w / iw, h / ih) * zoom;
  const sw = w / s, sh = h / s;
  const sx = clamp((crop.fx ?? 0.5) * iw - sw / 2, 0, iw - sw);
  const sy = clamp((crop.fy ?? 0.45) * ih - sh / 2, 0, ih - sh);
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  return s;
}

function wrap(ctx, text, maxW) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width <= maxW || !line) line = next;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
}

/** Largest font size (step 4) where the text fits in maxLines lines. */
function fit(ctx, text, { weight = 800, max, min, maxW, maxLines, lang, track = () => 0 }) {
  let size = max, lines;
  for (; size >= min; size -= 4) {
    setFont(ctx, weight, size, lang, track(size));
    lines = wrap(ctx, text, maxW);
    if (lines.length <= maxLines && lines.every((l) => ctx.measureText(l).width <= maxW)) break;
  }
  size = Math.max(size, min);
  setFont(ctx, weight, size, lang, track(size));
  lines = wrap(ctx, text, maxW);
  if (lines.length > maxLines) { lines = lines.slice(0, maxLines); lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '') + '…'; }
  return { size, lines };
}

const tightTrack = (lang) => (size) => (lang === 'yi' ? -size * 0.01 : -size * 0.045);

/** Text block that starts at the reading edge (left for English, right for Yiddish). */
function edge(lang, left, right) { return lang === 'yi' ? right : left; }
function setDir(ctx, lang) { ctx.direction = lang === 'yi' ? 'rtl' : 'ltr'; ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic'; }

function pill(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawLogo(ctx, logo, x, y, h) {
  if (!logo) return 0;
  const w = h * (logo.naturalWidth / logo.naturalHeight);
  ctx.drawImage(logo, x, y, w, h);
  return w;
}

/** Year pill, e.g. "SUKKOS 2026" / "סוכות תשפ״ז". Anchored at its right edge. */
function yearPill(ctx, d, right, top) {
  const text = COPY[d.lang].year(d.year);
  setDir(ctx, d.lang);
  setFont(ctx, 700, 30, d.lang, d.lang === 'yi' ? 0 : 4);
  const tw = ctx.measureText(text).width;
  const w = tw + 48, h = 60;
  pill(ctx, right - w, top, w, h, 4, LIME);
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.fillText(text, right - w / 2, top + 41);
  ctx.textAlign = 'start';
}

function qrBlock(ctx, d, x, y, size) {
  ctx.fillStyle = WHITE;
  ctx.fillRect(x, y, size, size);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(d.qr, x, y, size, size);
  ctx.imageSmoothingEnabled = true;
}

/* ---------------- Templates ---------------- */

function bold(ctx, d) {
  const P = 72, L = d.lang, rtl = L === 'yi';
  ctx.fillStyle = WHITE; ctx.fillRect(0, 0, W, H);
  drawLogo(ctx, d.logo, P, 86, 58);
  yearPill(ctx, d, W - P, 84);

  const photo = { x: P, y: 188, w: W - P * 2, h: 880 };
  const scale = drawCover(ctx, d.img, photo.x, photo.y, photo.w, photo.h, d.crop);

  // Headline with a citron marker behind the last line.
  setDir(ctx, L);
  const hl = fit(ctx, d.headline, { max: 144, min: 84, maxW: W - P * 2, maxLines: 2, lang: L, track: tightTrack(L) });
  const lh = hl.size * (rtl ? 1.02 : 0.9);
  let y = photo.y + photo.h + 40 + hl.size * 0.86;
  hl.lines.forEach((line, i) => {
    if (i === hl.lines.length - 1) {
      const lw = ctx.measureText(line).width;
      ctx.fillStyle = LIME;
      const hx = rtl ? W - P - lw - 10 : P - 10;
      ctx.fillRect(hx, y - hl.size * 0.3, lw + 20, hl.size * 0.34);
    }
    ctx.fillStyle = INK;
    ctx.fillText(line, edge(L, P, W - P), y);
    if (i < hl.lines.length - 1) y += lh;
  });

  // Title · location, then the vote line.
  y += 84;
  setFont(ctx, 700, 42, L, -0.5);
  ctx.fillStyle = INK;
  const title = fit(ctx, d.title, { weight: 700, max: 44, min: 32, maxW: W - P * 2, maxLines: 1, lang: L, track: () => -0.5 });
  ctx.fillText(iso(title.lines[0]), edge(L, P, W - P), y);
  if (d.showLoc && d.location) {
    y += 54;
    setFont(ctx, 500, 36, L);
    ctx.fillStyle = MUTE;
    ctx.fillText(iso(d.location), edge(L, P, W - P), y);
  }

  // Footer: QR on the outer edge, scan text + link on the reading side.
  const Q = 250, qy = H - P - Q;
  const qx = rtl ? P : W - P - Q;
  qrBlock(ctx, d, qx, qy, Q);
  const tx = rtl ? W - P : P;
  let fy = qy + 62;
  setFont(ctx, 800, 50, L, rtl ? 0 : -1.5);
  ctx.fillStyle = INK;
  ctx.fillText(d.voteLine, tx, fy);
  fy += 58;
  setFont(ctx, 500, 32, 'en');
  ctx.fillStyle = MUTE;
  ctx.direction = 'ltr'; ctx.textAlign = rtl ? 'right' : 'left';
  ctx.fillText(d.shortUrl, tx, fy);
  setDir(ctx, L);
  if (d.showVotes && d.votes > 0) {
    fy += 64;
    setFont(ctx, 700, 36, L);
    ctx.fillStyle = INK;
    ctx.fillText(iso(COPY[L].votes(d.votes)), tx, fy);
  }
  setFont(ctx, 600, 26, L, rtl ? 0 : 3);
  ctx.fillStyle = MUTE;
  ctx.textAlign = 'center';
  ctx.fillText(rtl ? COPY[L].scan : COPY[L].scan.toUpperCase(), qx + Q / 2, qy - 18);
  ctx.textAlign = 'start';
  return { photo, scale };
}

function clean(ctx, d) {
  const P = 80, L = d.lang, rtl = L === 'yi';
  ctx.fillStyle = WHITE; ctx.fillRect(0, 0, W, H);
  const photo = { x: 0, y: 0, w: W, h: 1160 };
  const scale = drawCover(ctx, d.img, photo.x, photo.y, photo.w, photo.h, d.crop);

  setDir(ctx, L);
  let y = photo.h + 96;
  setFont(ctx, 700, rtl ? 34 : 28, L, rtl ? 0 : 7);
  ctx.fillStyle = INK;
  ctx.fillText(COPY[L].now, edge(L, P, W - P), y);
  // small citron rule before the eyebrow
  ctx.fillStyle = LIME;
  ctx.fillRect(rtl ? W - P - 64 : P, y + 22, 64, 8);

  const t = fit(ctx, d.title, { max: 126, min: 72, maxW: W - P * 2, maxLines: 2, lang: L, track: tightTrack(L) });
  y += 40 + t.size;
  ctx.fillStyle = INK;
  t.lines.forEach((line, i) => { ctx.fillText(line, edge(L, P, W - P), y); if (i < t.lines.length - 1) y += t.size * (rtl ? 1.02 : 0.92); });

  const meta = metaLine(d);
  if (meta) {
    y += 70;
    setFont(ctx, 500, 38, L);
    ctx.fillStyle = MUTE;
    ctx.fillText(meta, edge(L, P, W - P), y);
  }
  if (d.headlineOn) {
    y += 64;
    setFont(ctx, 600, 40, L, rtl ? 0 : -0.5);
    ctx.fillStyle = INK;
    ctx.fillText(d.headline, edge(L, P, W - P), y);
  }

  // Button + logo on the reading side, QR on the outer edge.
  const Q = 230, qy = H - P - Q, qx = rtl ? P : W - P - Q;
  qrBlock(ctx, d, qx, qy, Q);
  setFont(ctx, 700, 40, L, rtl ? 0 : -0.5);
  const label = `${d.button}  ${rtl ? '←' : '→'}`;
  const bw = ctx.measureText(label).width + 96, bh = 104;
  const bx = rtl ? W - P - bw : P;
  pill(ctx, bx, qy, bw, bh, 52, INK);
  ctx.fillStyle = WHITE;
  ctx.textAlign = 'center';
  ctx.fillText(label, bx + bw / 2, qy + 66);
  ctx.textAlign = 'start';
  setFont(ctx, 500, 30, 'en');
  ctx.fillStyle = MUTE;
  ctx.direction = 'ltr'; ctx.textAlign = rtl ? 'right' : 'left';
  ctx.fillText(d.shortUrl, rtl ? W - P : P, qy + bh + 56);
  ctx.textAlign = 'start';
  const lw = 46 * (d.logo ? d.logo.naturalWidth / d.logo.naturalHeight : 4.5);
  drawLogo(ctx, d.logo, rtl ? W - P - lw : P, qy + Q - 46, 46);
  return { photo, scale };
}

function photoFirst(ctx, d) {
  const M = 56, L = d.lang, rtl = L === 'yi';
  const photo = { x: 0, y: 0, w: W, h: H };
  const scale = drawCover(ctx, d.img, 0, 0, W, H, d.crop);

  // Logo on a small white tab, year on citron.
  const lh = 44, lw = lh * (d.logo ? d.logo.naturalWidth / d.logo.naturalHeight : 4.5);
  pill(ctx, M, 72, lw + 56, 92, 46, WHITE);
  drawLogo(ctx, d.logo, M + 28, 72 + 24, lh);
  yearPill(ctx, d, W - M, 88);

  // Floating card.
  const cw = W - M * 2, cx = M, pad = 52, Q = 220;
  setDir(ctx, L);
  const t = fit(ctx, d.title, { max: 96, min: 60, maxW: cw - pad * 2, maxLines: 2, lang: L, track: tightTrack(L) });
  const titleH = t.size + (t.lines.length - 1) * t.size * (rtl ? 1.02 : 0.92);
  const ch = pad + titleH + 34 + 64 + 40 + Q + pad;
  const cy = H - M - ch;
  pill(ctx, cx, cy, cw, ch, 36, WHITE);

  let y = cy + pad + t.size * 0.86;
  ctx.fillStyle = INK;
  t.lines.forEach((line, i) => { ctx.fillText(line, edge(L, cx + pad, cx + cw - pad), y); if (i < t.lines.length - 1) y += t.size * (rtl ? 1.02 : 0.92); });

  // Vote line on a citron marker.
  y += 34 + 50;
  setFont(ctx, 800, 44, L, rtl ? 0 : -1);
  const vw = ctx.measureText(d.voteLine).width;
  ctx.fillStyle = LIME;
  ctx.fillRect(rtl ? cx + cw - pad - vw - 14 : cx + pad - 14, y - 44, vw + 28, 62);
  ctx.fillStyle = INK;
  ctx.fillText(d.voteLine, edge(L, cx + pad, cx + cw - pad), y);

  // QR + link row.
  const qy = cy + ch - pad - Q, qx = rtl ? cx + pad : cx + cw - pad - Q;
  qrBlock(ctx, d, qx, qy, Q);
  const tx = rtl ? cx + cw - pad : cx + pad;
  let fy = qy + 70;
  if (d.headlineOn) {
    setFont(ctx, 600, 36, L);
    ctx.fillStyle = INK;
    const h = fit(ctx, d.headline, { weight: 600, max: 36, min: 26, maxW: cw - pad * 2 - Q - 30, maxLines: 2, lang: L, track: () => 0 });
    h.lines.forEach((line) => { ctx.fillText(line, tx, fy); fy += h.size * 1.2; });
    fy += 6;
  }
  const meta = metaLine(d);
  if (meta) { setFont(ctx, 500, 32, L); ctx.fillStyle = MUTE; ctx.fillText(meta, tx, fy); fy += 50; }
  setFont(ctx, 500, 30, 'en');
  ctx.fillStyle = MUTE;
  ctx.direction = 'ltr'; ctx.textAlign = rtl ? 'right' : 'left';
  ctx.fillText(d.shortUrl, tx, qy + Q - 8);
  ctx.textAlign = 'start';
  return { photo, scale };
}

const RENDERERS = { bold, clean, photo: photoFirst };

/**
 * Draw a card. d = { template, img, logo, qr, title, location, votes, year, lang, owner,
 *   headline, headlineOn, voteLine, button, showLoc, showVotes, shortUrl, crop }
 * Returns { photo: rect, scale } — scale > ~1.5 means the photo is being enlarged (may look soft).
 */
export function renderCard(canvas, d) {
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  return (RENDERERS[d.template] || bold)(ctx, d);
}

export const toBlob = (canvas) => new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.92));
