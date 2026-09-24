// Data layer. V1 runs entirely in the browser: state lives in localStorage and
// uploaded photos live in IndexedDB. Every read/write goes through this module,
// so moving to a real backend (Supabase, Firebase, a small API) means
// re-implementing these functions and nothing else.

import { SEED_SUKKAHS, SEED_USERS, SEED_PRODUCTS, SEED_SETTINGS } from './seed.js';

const KEY = 'sp:v1';
const DEVICE_KEY = 'sp:device';
const listeners = new Set();

const uid = (p = '') => p + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
const clone = (o) => JSON.parse(JSON.stringify(o));
export const slugify = (s) => s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'sukkah';

function seedState() {
  const sukkahs = SEED_SUKKAHS.map((s) => ({
    id: uid('s-'),
    status: 'approved',
    sample: true,
    featured: false,
    editorsPick: false,
    cover: 0,
    hero: 0,
    ...clone(s),
    ownerName: SEED_USERS.find((u) => u.id === s.owner)?.display || '',
    photos: s.photos.map((ph) => ({
      id: uid('p-'),
      src: ph.src,
      label: ph.label,
      hotspots: ph.hotspots.map((h) => ({ id: uid('h-'), x: h.x, y: h.y, ...clone(SEED_PRODUCTS[h.p]) })),
    })),
  }));
  return { version: 1, sukkahs, users: clone(SEED_USERS), votes: [], verified: {}, codes: {}, settings: { ...SEED_SETTINGS } };
}

let state;
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return seedState();
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('Could not save state', e); }
  listeners.forEach((fn) => fn());
}
state = load();

export const onChange = (fn) => (listeners.add(fn), () => listeners.delete(fn));

export function device() {
  try {
    let d = localStorage.getItem(DEVICE_KEY);
    if (!d) localStorage.setItem(DEVICE_KEY, (d = uid('d-')));
    return d;
  } catch { return 'anon'; }
}

/* ---------------- Sukkahs ---------------- */

const age = (s) => Math.max(0.1, (Date.now() - new Date(s.createdAt)) / 864e5);
const trendScore = (s) => (s.votes + 40) / Math.pow(age(s) + 2, 0.45) + (s.featured ? 60 : 0);

export const SORTS = {
  trending: (a, b) => trendScore(b) - trendScore(a),
  new: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  voted: (a, b) => b.votes - a.votes,
};

export function list({ status = 'approved', sort = 'trending', category, q } = {}) {
  let out = state.sukkahs.filter((s) => status === 'all' || s.status === status);
  if (category) out = out.filter((s) => s.categories.some((c) => c.toLowerCase() === category.toLowerCase()));
  if (q) {
    const n = q.toLowerCase();
    out = out.filter((s) => [s.title, s.location, s.ownerName, s.description, ...s.categories, ...(s.tags || [])].join(' ').toLowerCase().includes(n));
  }
  return out.sort(SORTS[sort] || SORTS.trending);
}

export const get = (slug) => state.sukkahs.find((s) => s.slug === slug || s.id === slug);
export const settings = () => state.settings;
export const coverOf = (s) => s.photos[s.cover] || s.photos[0];
export const heroOf = (s) => s.photos[s.hero ?? s.cover] || coverOf(s);

export function update(id, patch) {
  const s = state.sukkahs.find((x) => x.id === id);
  if (!s) return;
  Object.assign(s, patch);
  save();
  return s;
}
export const remove = (id) => { state.sukkahs = state.sukkahs.filter((s) => s.id !== id); state.votes = state.votes.filter((v) => v.sukkahId !== id); save(); };
export const setSettings = (patch) => { Object.assign(state.settings, patch); save(); };

export function submit(draft) {
  let slug = slugify(draft.title);
  while (state.sukkahs.some((s) => s.slug === slug)) slug += '-' + Math.random().toString(36).slice(2, 5);
  const s = {
    id: uid('s-'), slug, status: 'pending', sample: false, featured: false, editorsPick: false,
    votes: 0, createdAt: new Date().toISOString(),
    title: draft.title, location: draft.location, description: draft.description, special: draft.special,
    categories: draft.categories, tags: draft.categories.slice(0, 3),
    ownerName: draft.ownerName, contact: draft.contact,
    cover: draft.cover, hero: draft.cover,
    photos: draft.photos.map((p) => ({ id: p.id, src: p.src, label: p.label, hotspots: p.hotspots.map((h) => ({ ...h })) })),
  };
  state.sukkahs.push(s);
  save();
  return s;
}

/** Swap a sample sukkah's slot (featured / pick flags) onto a real one and delete the sample. */
export function replaceSample(sampleId, realId) {
  const a = state.sukkahs.find((s) => s.id === sampleId);
  const b = state.sukkahs.find((s) => s.id === realId);
  if (!a || !b) return;
  Object.assign(b, { featured: a.featured, editorsPick: a.editorsPick, status: 'approved' });
  remove(sampleId);
}
export const removeSamples = () => { const ids = new Set(state.sukkahs.filter((s) => s.sample).map((s) => s.id)); state.sukkahs = state.sukkahs.filter((s) => !ids.has(s.id)); state.votes = state.votes.filter((v) => !ids.has(v.sukkahId)); save(); };
export const restoreSamples = () => {
  const fresh = seedState().sukkahs.filter((s) => !state.sukkahs.some((x) => x.slug === s.slug));
  state.sukkahs.push(...fresh); save();
};
export const resetAll = () => { state = seedState(); save(); };

/* ---------------- Products (derived from hotspots) ---------------- */

const SOURCE_MAP = {
  Table: 'Tables', Seating: 'Chairs', Lighting: 'Lighting', Walls: 'Wall Ideas', Panels: 'Wall Ideas',
  Flooring: 'Flooring', Rugs: 'Flooring', Bedding: 'Linens', Decor: 'Decor', Kids: 'Kids',
  Structure: 'Structure', DIY: 'DIY', 'Judaica / Sukkos Decor': 'Decor',
};
export const SOURCE_CATEGORIES = ['Lighting', 'Tables', 'Chairs', 'Linens', 'Decor', 'Wall Ideas', 'Flooring', 'DIY', 'Kids', 'Structure', 'Accessories'];
export const productKey = (h) => slugify(`${h.name}-${h.vendor || ''}`);

export function products() {
  const map = new Map();
  for (const s of list()) {
    s.photos.forEach((ph) => ph.hotspots.forEach((h) => {
      const key = productKey(h);
      if (!map.has(key)) map.set(key, { key, ...h, shelf: h.source || SOURCE_MAP[h.category] || 'Accessories', seen: [] });
      const item = map.get(key);
      if (!item.seen.some((x) => x.sukkah.id === s.id)) item.seen.push({ sukkah: s, photo: ph, x: h.x, y: h.y });
    }));
  }
  return [...map.values()].sort((a, b) => b.seen.length - a.seen.length || a.name.localeCompare(b.name));
}

/** Every hotspot across every sukkah, for admin review. */
export function allHotspots() {
  const out = [];
  state.sukkahs.forEach((s) => s.photos.forEach((ph) => ph.hotspots.forEach((h) => out.push({ s, ph, h }))));
  return out;
}
export function removeHotspot(sukkahId, hotspotId) {
  const s = state.sukkahs.find((x) => x.id === sukkahId);
  s?.photos.forEach((ph) => (ph.hotspots = ph.hotspots.filter((h) => h.id !== hotspotId)));
  save();
}
export function patchHotspot(sukkahId, hotspotId, patch) {
  const s = state.sukkahs.find((x) => x.id === sukkahId);
  s?.photos.forEach((ph) => ph.hotspots.forEach((h) => h.id === hotspotId && Object.assign(h, patch)));
  save();
}

/* ---------------- Voting ----------------
 * Lightweight verification: an email gets a 6-digit code once; after that the
 * device remembers the verified email. One vote per email per sukkah, and one
 * per device per sukkah, which stops the obvious duplicates.
 *
 * DEMO MODE: there is no mail server, so requestCode() returns the code and the
 * UI shows it. With a backend, send the email server-side and return nothing.
 */

const VERIFIED_KEY = 'sp:voter';
export const voterEmail = () => { try { return localStorage.getItem(VERIFIED_KEY) || ''; } catch { return ''; } };
const normEmail = (e) => e.trim().toLowerCase();
export const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());

export function requestCode(email) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  state.codes[normEmail(email)] = { code, at: Date.now() };
  save();
  return code;
}
export function verifyCode(email, code) {
  const e = normEmail(email);
  const rec = state.codes[e];
  if (!rec || rec.code !== code.trim() || Date.now() - rec.at > 15 * 60e3) return false;
  delete state.codes[e];
  state.verified[e] = true;
  try { localStorage.setItem(VERIFIED_KEY, e); } catch {}
  save();
  return true;
}

export function hasVoted(sukkahId) {
  const e = voterEmail();
  const d = device();
  return state.votes.some((v) => v.sukkahId === sukkahId && (v.device === d || (e && v.email === e)));
}

/** @returns {'ok'|'duplicate'|'unverified'} */
export function castVote(sukkahId) {
  const e = voterEmail();
  if (!e || !state.verified[e]) return 'unverified';
  if (hasVoted(sukkahId)) return 'duplicate';
  state.votes.push({ id: uid('v-'), sukkahId, email: e, device: device(), at: new Date().toISOString() });
  const s = state.sukkahs.find((x) => x.id === sukkahId);
  if (s) s.votes += 1;
  save();
  return 'ok';
}
export const votes = () => state.votes.slice().reverse();
export function removeVote(id) {
  const v = state.votes.find((x) => x.id === id);
  if (!v) return;
  state.votes = state.votes.filter((x) => x.id !== id);
  const s = state.sukkahs.find((x) => x.id === v.sukkahId);
  if (s) s.votes = Math.max(0, s.votes - 1);
  save();
}

/* ---------------- Photo storage (IndexedDB) ----------------
 * Uploaded photos are stored as blobs; their `src` is "idb:<id>".
 */

let dbp;
const db = () => (dbp ??= new Promise((res, rej) => {
  const r = indexedDB.open('sp-photos', 1);
  r.onupgradeneeded = () => r.result.createObjectStore('photos');
  r.onsuccess = () => res(r.result);
  r.onerror = () => rej(r.error);
}));
export async function putPhoto(id, blob) {
  const d = await db();
  await new Promise((res, rej) => { const tx = d.transaction('photos', 'readwrite'); tx.objectStore('photos').put(blob, id); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
  return 'idb:' + id;
}
const urlCache = new Map();
export async function photoURL(src) {
  if (!src?.startsWith('idb:')) return src;
  if (urlCache.has(src)) return urlCache.get(src);
  const d = await db();
  const blob = await new Promise((res) => { const r = d.transaction('photos').objectStore('photos').get(src.slice(4)); r.onsuccess = () => res(r.result); r.onerror = () => res(null); });
  const url = blob ? URL.createObjectURL(blob) : '';
  urlCache.set(src, url);
  return url;
}
export const uidFor = uid;
