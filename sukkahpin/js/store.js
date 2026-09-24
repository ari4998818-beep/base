// Data layer, backed by Supabase (Postgres + Auth + Storage).
//
// Pages read from an in-memory cache synchronously (list/get/products…); every
// write goes to Supabase first and then updates the cache. Row Level Security
// in the database is what actually protects data — this file just talks to it.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.1/+esm';
import { SUPABASE_URL, SUPABASE_KEY, PHOTO_BUCKET } from './config.js';
import { SEED_SUKKAHS, SEED_USERS, SEED_PRODUCTS, SEED_SETTINGS } from './seed.js';

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' },
});

const TABLE = 'sp_sukkahs';
const DEVICE_KEY = 'sp:device';
const listeners = new Set();

const state = { sukkahs: [], settings: { ...SEED_SETTINGS }, myVotes: new Set(), session: null, admin: false, contacts: {} };

export const uid = (p = '') => p + (crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36));
export const uidFor = uid;
export const slugify = (s) => s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'sukkah';
const notify = () => listeners.forEach((fn) => fn());
export const onChange = (fn) => (listeners.add(fn), () => listeners.delete(fn));

/* ---------------- Row mapping ---------------- */

const fromRow = (r) => ({
  id: r.id, slug: r.slug, status: r.status, sample: r.sample, featured: r.featured, editorsPick: r.editors_pick,
  title: r.title, location: r.location, description: r.description, special: r.special,
  categories: r.categories || [], tags: r.tags || [], ownerName: r.owner_name,
  cover: r.cover ?? 0, hero: r.hero ?? r.cover ?? 0, photos: r.photos || [], votes: r.votes, createdAt: r.created_at,
  year: r.year || thisYear(), visit: r.visit || {}, video: r.video || null, editedAt: r.edited_at || null,
});
export const fromDbRow = fromRow;
const COLS = { title: 'title', location: 'location', description: 'description', special: 'special', categories: 'categories', tags: 'tags', ownerName: 'owner_name', cover: 'cover', hero: 'hero', photos: 'photos', votes: 'votes', status: 'status', sample: 'sample', featured: 'featured', editorsPick: 'editors_pick', year: 'year', visit: 'visit', video: 'video' };
const toRow = (patch) => Object.fromEntries(Object.entries(patch).filter(([k]) => COLS[k]).map(([k, v]) => [COLS[k], v]));

/* ---------------- Year / visiting / video helpers ---------------- */

export const thisYear = () => new Date().getFullYear();
export const hebrewYear = (y) => y + 3761; // Sukkos falls in the autumn, after Rosh Hashanah
/** Open to visitors right now: this year's sukkah and the owner opted in. */
export const isOpenToVisit = (s) => s.year === thisYear() && !!s.visit?.open;

/** Turns a pasted link into something playable, or null if we can't embed it. */
export function parseVideoLink(raw) {
  const u = (raw || '').trim();
  let m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (m) return { kind: 'youtube', url: `https://www.youtube-nocookie.com/embed/${m[1]}` };
  m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) return { kind: 'vimeo', url: `https://player.vimeo.com/video/${m[1]}` };
  if (/^https:\/\/\S+\.(mp4|webm|mov)(\?\S*)?$/i.test(u)) return { kind: 'file', url: u };
  return null;
}

/* ---------------- Boot ---------------- */

async function loadSukkahs() {
  const { data, error } = await sb.from(TABLE).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  state.sukkahs = data.map(fromRow);
}
async function loadSettings() {
  const { data } = await sb.from('sp_settings').select('data').eq('id', 1).maybeSingle();
  if (data?.data) state.settings = { ...SEED_SETTINGS, ...data.data };
}
async function loadMyVotes() {
  state.myVotes = new Set();
  if (!state.session) return;
  const { data } = await sb.from('sp_votes').select('sukkah_id').eq('user_id', state.session.user.id);
  (data || []).forEach((v) => state.myVotes.add(v.sukkah_id));
}
async function loadAdmin() {
  state.admin = false;
  if (!state.session) return;
  const { data } = await sb.rpc('sp_is_admin');
  state.admin = !!data;
}

export async function init() {
  const { data } = await sb.auth.getSession();
  state.session = data.session;
  await Promise.all([loadSukkahs(), loadSettings(), loadMyVotes(), loadAdmin()]);
  sb.auth.onAuthStateChange(async (event, session) => {
    if ((session?.user?.id || null) === (state.session?.user?.id || null)) { state.session = session; return; }
    state.session = session;
    await loadAdmin();
    await Promise.all([loadSukkahs(), loadMyVotes()]);
    notify();
  });
}
export const refresh = async () => { await Promise.all([loadSukkahs(), loadSettings(), loadMyVotes()]); notify(); };

/* ---------------- Sukkahs (sync reads from cache) ---------------- */

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
export const isAdmin = () => state.admin;
export const session = () => state.session;
/** A real (email) account — not a one-tap guest voter. */
export const isMember = () => !!state.session && !state.session.user?.is_anonymous;
export const contactOf = (id) => state.contacts[id];

/* ---------------- Admin writes ---------------- */

const replaceLocal = (row) => {
  const s = fromRow(row);
  const i = state.sukkahs.findIndex((x) => x.id === s.id);
  if (i >= 0) state.sukkahs[i] = s; else state.sukkahs.unshift(s);
  return s;
};

export async function update(id, patch) {
  const { data, error } = await sb.from(TABLE).update(toRow(patch)).eq('id', id).select().single();
  if (error) throw error;
  const s = replaceLocal(data);
  notify();
  return s;
}
const uploadedPaths = (s) => [...(s?.photos || []).map((p) => p.src), s?.video?.url]
  .map((u) => u?.split(`/${PHOTO_BUCKET}/`)[1]).filter((x) => x?.startsWith('uploads/'));

export async function remove(id) {
  const paths = uploadedPaths(get(id));
  const { error } = await sb.from(TABLE).delete().eq('id', id);
  if (error) throw error;
  if (paths.length) await sb.storage.from(PHOTO_BUCKET).remove(paths); // best effort
  state.sukkahs = state.sukkahs.filter((s) => s.id !== id);
  notify();
}
export async function setSettings(patch) {
  const next = { ...state.settings, ...patch };
  const { error } = await sb.from('sp_settings').update({ data: next }).eq('id', 1);
  if (error) throw error;
  state.settings = next;
  notify();
}
export async function loadContacts() {
  const { data } = await sb.from('sp_contacts').select('*');
  state.contacts = Object.fromEntries((data || []).map((c) => [c.sukkah_id, c]));
}

/** Give a sample's featured / pick slot to a real sukkah, approve it, delete the sample. */
export async function replaceSample(sampleId, realId) {
  const a = get(sampleId);
  if (!a) return;
  await update(realId, { featured: a.featured, editorsPick: a.editorsPick, status: 'approved' });
  await remove(sampleId);
}
export async function removeSamples() {
  const { error } = await sb.from(TABLE).delete().eq('sample', true);
  if (error) throw error;
  await loadSukkahs();
  notify();
}
export async function restoreSamples() {
  const have = new Set(state.sukkahs.map((s) => s.slug));
  const rows = SEED_SUKKAHS.filter((s) => !have.has(s.slug)).map((s) => ({
    slug: s.slug, status: 'approved', sample: true, featured: !!s.featured, editors_pick: !!s.editorsPick,
    title: s.title, location: s.location, description: s.description, special: s.special || '',
    categories: s.categories, tags: s.tags, owner_name: SEED_USERS.find((u) => u.id === s.owner)?.display || '',
    cover: 0, hero: s.hero ?? 0, votes: s.votes, year: s.year || thisYear(), visit: s.visit || {},
    photos: s.photos.map((ph) => ({ id: uid(), src: ph.src, label: ph.label, hotspots: ph.hotspots.map((h) => ({ id: uid(), x: h.x, y: h.y, ...SEED_PRODUCTS[h.p] })) })),
  }));
  if (rows.length) {
    const { error } = await sb.from(TABLE).insert(rows);
    if (error) throw error;
  }
  await loadSukkahs();
  notify();
}

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

export function allHotspots() {
  const out = [];
  state.sukkahs.forEach((s) => s.photos.forEach((ph) => ph.hotspots.forEach((h) => out.push({ s, ph, h }))));
  return out;
}
const mapHotspots = (s, fn) => s.photos.map((ph) => ({ ...ph, hotspots: fn(ph.hotspots) }));
export const removeHotspot = (sukkahId, hotspotId) => update(sukkahId, { photos: mapHotspots(get(sukkahId), (hs) => hs.filter((h) => h.id !== hotspotId)) });
export const patchHotspot = (sukkahId, hotspotId, patch) => update(sukkahId, { photos: mapHotspots(get(sukkahId), (hs) => hs.map((h) => (h.id === hotspotId ? { ...h, ...patch } : h))) });

/* ---------------- Submissions ---------------- */

/** Uploads a (downscaled) photo blob and returns its public URL. */
export async function uploadPhoto(blob) {
  const path = `uploads/${uid()}.jpg`;
  const { error } = await sb.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
  if (error) throw error;
  return sb.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}

export const MAX_VIDEO_MB = 50;
/** Uploads a video file as-is (phones already compress) and returns its public URL. */
export async function uploadVideo(file) {
  const ext = (file.name.split('.').pop() || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp4';
  const path = `uploads/${uid()}.${ext}`;
  const type = file.type || (ext === 'mov' ? 'video/quicktime' : `video/${ext}`);
  const { error } = await sb.storage.from(PHOTO_BUCKET).upload(path, file, { contentType: type, cacheControl: '31536000' });
  if (error) throw error;
  return sb.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Creates a pending sukkah + private contact in one call. Returns the new slug. */
export async function submit(draft) {
  const { data, error } = await sb.rpc('sp_submit', {
    p: {
      title: draft.title, location: draft.location, description: draft.description || '', special: draft.special || '',
      categories: draft.categories, owner_name: draft.ownerName, cover: draft.cover,
      photos: draft.photos, name: draft.contact.name, email: draft.contact.email, phone: draft.contact.phone || '',
      year: draft.year, visit: draft.visit || { open: false }, video: draft.video || null,
    },
  });
  if (error) throw error;
  const res = typeof data === 'string' ? { slug: data } : data;
  if (res.key) saveKey(res.slug, res.key);
  return res;
}

/* ---------------- Owner editing (private edit link, no account) ---------------- */

const KEYS = 'sp:editKeys';
const readKeys = () => { try { return JSON.parse(localStorage.getItem(KEYS) || '{}'); } catch { return {}; } };
export function saveKey(slug, key) { try { localStorage.setItem(KEYS, JSON.stringify({ ...readKeys(), [slug]: key })); } catch {} }
export const myKey = (slug) => readKeys()[slug] || '';
export const editLink = (slug, key) => `${location.origin}${location.pathname}#/edit/${slug}?k=${key}`;

/** Returns the sukkah (any status) + its contact, or null if the key doesn't match. */
export async function ownerGet(slug, key) {
  const { data, error } = await sb.rpc('sp_owner_get', { p_slug: slug, p_key: key });
  if (error || !data) return null;
  return { ...fromRow(data), contact: data.contact || {} };
}
export async function ownerUpdate(slug, key, draft) {
  const { error } = await sb.rpc('sp_owner_update', {
    p_slug: slug, p_key: key,
    p: {
      title: draft.title, location: draft.location, description: draft.description || '', special: draft.special || '',
      categories: draft.categories, owner_name: draft.ownerName, cover: draft.cover, photos: draft.photos,
      name: draft.contact.name, email: draft.contact.email, phone: draft.contact.phone || '',
      year: draft.year, visit: draft.visit || { open: false }, video: draft.video || null,
    },
  });
  if (error) throw error;
  saveKey(slug, key);
  await loadSukkahs();
  notify();
}
/** Admin: mint a new owner edit link (replaces the old one). */
export async function ownerLink(id) {
  const { data, error } = await sb.rpc('sp_owner_link', { p_id: id });
  if (error) throw error;
  const s = get(id);
  return editLink(s.slug, data);
}

/* ---------------- Auth (email code) ----------------
 * signInWithOtp emails a sign-in link, plus a 6-digit code once the Supabase
 * "Magic Link" email template includes {{ .Token }}. Both work here: the code
 * is entered in the modal; the link comes back to the site signed in.
 */

export const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());
export const voterEmail = () => state.session?.user?.email || '';

export async function requestCode(email, redirectTo = location.origin + location.pathname) {
  const { error } = await sb.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: true, emailRedirectTo: redirectTo } });
  if (error) throw error;
}
export async function verifyCode(email, code) {
  const { data, error } = await sb.auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.trim(), type: 'email' });
  if (error || !data.session) return false;
  state.session = data.session;
  await Promise.all([loadMyVotes(), loadAdmin()]);
  return true;
}
export async function signOut() {
  await sb.auth.signOut();
  state.session = null; state.admin = false; state.myVotes = new Set();
  await loadSukkahs();
  notify();
}

/* ---------------- Voting ----------------
 * The database allows one vote per signed-in user per sukkah (unique index) and
 * keeps sp_sukkahs.votes in sync with a trigger. The device marker only stops
 * the same phone voting twice with two different emails.
 */

export function device() {
  try {
    let d = localStorage.getItem(DEVICE_KEY);
    if (!d) localStorage.setItem(DEVICE_KEY, (d = uid()));
    return d;
  } catch { return 'anon'; }
}
const deviceVotes = () => { try { return new Set(JSON.parse(localStorage.getItem('sp:voted') || '[]')); } catch { return new Set(); } };
const markDevice = (id) => { try { const s = deviceVotes(); s.add(id); localStorage.setItem('sp:voted', JSON.stringify([...s])); } catch {} };

export const hasVoted = (sukkahId) => state.myVotes.has(sukkahId) || deviceVotes().has(sukkahId);

/**
 * One-tap voting: without a session we sign the phone in as an anonymous guest
 * (Supabase "anonymous sign-ins" — no email). Returns false if that's switched
 * off in the dashboard, so the UI can fall back to email.
 */
export async function ensureVoter() {
  if (state.session) return true;
  const { data, error } = await sb.auth.signInAnonymously();
  if (error || !data.session) { console.warn('guest sign-in unavailable:', error?.message); return false; }
  state.session = data.session;
  await loadMyVotes();
  return true;
}

/** @returns {Promise<'ok'|'duplicate'|'unverified'|'limit'|'error'>} */
export async function castVote(sukkahId) {
  if (!state.session) return 'unverified';
  if (hasVoted(sukkahId)) return 'duplicate';
  const { error } = await sb.from('sp_votes').insert({ sukkah_id: sukkahId });
  if (error) {
    if (error.code === '23505') { state.myVotes.add(sukkahId); markDevice(sukkahId); notify(); return 'duplicate'; }
    if (error.code === 'P0429') return 'limit';
    console.error(error);
    return 'error';
  }
  state.myVotes.add(sukkahId);
  markDevice(sukkahId);
  const s = get(sukkahId);
  if (s) s.votes += 1;
  notify();
  return 'ok';
}

export async function votes() {
  const { data, error } = await sb.from('sp_votes').select('id, sukkah_id, email, ip_hash, created_at').order('created_at', { ascending: false }).limit(500);
  if (error) throw error;
  return data.map((v) => ({ id: v.id, sukkahId: v.sukkah_id, email: v.email, ip: v.ip_hash, at: v.created_at }));
}
export async function removeVote(id, sukkahId) {
  const { error } = await sb.from('sp_votes').delete().eq('id', id);
  if (error) throw error;
  const s = get(sukkahId);
  if (s) s.votes = Math.max(0, s.votes - 1);
  notify();
}

/** Admin-only: pull everything including pending/rejected (RLS returns them to admins). */
export async function adminLoad() {
  await Promise.all([loadSukkahs(), loadContacts()]);
}
