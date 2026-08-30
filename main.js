/* =============================================================
   CHLOE JEWELERS — Interactions
   No frameworks, no build step. Progressive enhancement only.
   ============================================================= */

/* -------------------------------------------------------------
   CONFIG — the only values changed routinely.
   ------------------------------------------------------------- */
const CONFIG = {
  /* Cal.com event path "username/event-slug". Leave EMPTY to show the
     refined "Online scheduling coming shortly" state. When set, the live
     Cal.com inline embed (availability, calendar sync, confirmations,
     rescheduling, cancellation) replaces it. Booking questions — name,
     phone, email, and the optional "What are you looking for?" — are
     configured on the Cal.com event type itself. */
  calLink: "",
  calOrigin: "https://cal.com",
  phone: "845-538-0053",
  email: "chloejewelers@gmail.com"
};

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer  = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* Footer year */
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* Sticky nav shadow / brand reveal */
const nav = $("#nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* Mobile menu */
const toggle = $("#nav-toggle");
const menu = $("#mobile-menu");
const setMenu = (open) => {
  menu.classList.toggle("open", open);
  menu.setAttribute("aria-hidden", String(!open));
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.style.overflow = open ? "hidden" : "";
};
toggle.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
$$(".mobile-menu a").forEach(a => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

/* Smooth anchor scrolling (accounts for the fixed nav) */
function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - nav.offsetHeight + 1;
  window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
}
$$('a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    const id = link.getAttribute("href").slice(1);
    const target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    setMenu(false);
    scrollToId(id);
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
});

/* Scroll reveals */
if (reduceMotion) {
  $$(".reveal").forEach(el => el.classList.add("in"));
  $$("[data-value]").forEach(el => el.classList.add("in"));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach(el => io.observe(el));

  /* values reveal individually */
  const values = $$("[data-value]");
  if (values.length) {
    const vio = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        values.forEach((v, i) => setTimeout(() => v.classList.add("in"), i * 240));
        obs.disconnect();
      });
    }, { threshold: 0.4 });
    vio.observe(values[0]);
  }
}

/* Hero light-catches — activate after the case has drawn */
if (!reduceMotion) {
  setTimeout(() => $$(".sparkle").forEach(s => s.classList.add("go")), 2200);
}

/* Subtle cursor parallax on the framed photo + floating specimen */
if (finePointer && !reduceMotion) {
  const photo = $(".cell-photo img");
  const inset = $(".inset");
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
  const loop = () => {
    cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
    if (photo) photo.style.transform = `scale(1.04) translate(${cx * 0.5}px, ${cy * 0.5}px)`;
    if (inset) inset.style.transform = `translate(${cx * 1.4}px, ${cy * 1.4}px)`;
    raf = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) ? requestAnimationFrame(loop) : null;
  };
  const hero = $(".case");
  hero && hero.addEventListener("mousemove", e => {
    const r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 20;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 16;
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
}

/* Cal.com inline embed — loads only when CONFIG.calLink is set.
   Otherwise the refined "coming shortly" state remains. */
(function initScheduler() {
  const mount = $("#cal-inline");
  const cta = $("#appt-cta");
  if (!mount || !CONFIG.calLink) return;

  cta && (cta.style.display = "none");

  (function (C, A, L) {
    let p = function (a, ar) { a.q.push(ar); };
    let d = C.document;
    C.Cal = C.Cal || function () {
      let cal = C.Cal; let ar = arguments;
      if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; }
      if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]); } else p(cal, ar); return; }
      p(cal, ar);
    };
  })(window, "https://app.cal.com/embed/embed.js", "init");

  const Cal = window.Cal;
  Cal("init", { origin: CONFIG.calOrigin });
  Cal("inline", { elementOrSelector: "#cal-inline", calLink: CONFIG.calLink, layout: "month_view" });
  Cal("ui", {
    theme: "light",
    cssVarsPerTheme: {
      light: { "cal-brand": "#4C1423", "cal-text": "#272223", "cal-bg": "#F7F4F4", "cal-bg-muted": "#F1E9E1", "cal-border": "rgba(76,20,35,0.16)" }
    },
    hideEventTypeDetails: false
  });
})();
