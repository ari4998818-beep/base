/* =============================================================
   CHLOE JEWELERS — Interactions
   No frameworks, no build step. Progressive enhancement only:
   the page is fully usable with JavaScript disabled.
   ============================================================= */

/* -------------------------------------------------------------
   CONFIG — the only things you routinely change live here.
   ------------------------------------------------------------- */
const CONFIG = {
  /* Cal.com event path in the form "username/event-slug".
     Leave EMPTY to show the polished scheduler preview.
     Set it (e.g. "chloe-jewelers/private-appointment") to load
     the real Cal.com inline embed with live availability,
     Google Calendar sync, confirmations, rescheduling & cancellation.
     The booking questions (name, phone, email, and the optional
     "What are you looking for?") are configured on the Cal.com
     event type itself. */
  calLink: "",

  /* Optional: pin the Cal.com origin if you self-host. */
  calOrigin: "https://cal.com",

  /* Business contact — kept here so it is easy to update. */
  phone: "845-538-0053",
  email: "chloejewelers@gmail.com",

  /* Instagram profile URL. Leave EMPTY until a real handle exists —
     the link stays visible but will not navigate to an invented page. */
  instagram: ""
};

/* Shorthands */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer  = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* =========================================================
   Footer year
   ========================================================= */
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* =========================================================
   Sticky nav — light shadow after a little scroll
   ========================================================= */
const nav = $("#nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* =========================================================
   Mobile menu
   ========================================================= */
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

/* =========================================================
   Smooth anchor scrolling (accounts for the fixed nav) and
   scroll-to-scheduler for every appointment CTA.
   ========================================================= */
const navH = () => nav.offsetHeight;
function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - navH() + 1;
  window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
}
$$('a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    const id = link.getAttribute("href").slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    setMenu(false);
    scrollToId(id);
    // move focus for accessibility, without an extra jump
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
});

/* =========================================================
   Scroll reveals (IntersectionObserver)
   ========================================================= */
if (reduceMotion) {
  $$(".reveal").forEach(el => el.classList.add("in"));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach(el => io.observe(el));
}

/* =========================================================
   Brand values — reveal each word individually, then the sub
   ========================================================= */
const words = $$("[data-value]");
const valueSub = $("[data-value-sub]");
if (reduceMotion) {
  words.forEach(w => w.classList.add("in"));
  if (valueSub) valueSub.classList.add("in");
} else if (words.length) {
  const vio = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      words.forEach((w, i) => setTimeout(() => w.classList.add("in"), i * 260));
      if (valueSub) setTimeout(() => valueSub.classList.add("in"), words.length * 260);
      obs.disconnect();
    });
  }, { threshold: 0.4 });
  vio.observe(words[0]);
}

/* =========================================================
   Hero — gentle load-in, cursor parallax, subtle tilt, sparkles
   ========================================================= */
const heroMedia = $("[data-parallax]");
const heroFrame = $("[data-tilt]");
const heroTitle = $("[data-hero-title]");

// gentle entrance
requestAnimationFrame(() => {
  if (heroTitle) {
    $$(".line span", heroTitle).forEach((span, i) => {
      if (reduceMotion) return;
      span.style.transform = "translateY(105%)";
      span.style.transition = `transform 1s cubic-bezier(0.16,1,0.3,1) ${0.15 + i * 0.12}s`;
      requestAnimationFrame(() => { span.style.transform = "translateY(0)"; });
    });
  }
  if (heroFrame && !reduceMotion) {
    heroFrame.style.opacity = "0";
    heroFrame.style.transform = "scale(1.04)";
    heroFrame.style.transition = "opacity 1.3s ease, transform 1.6s cubic-bezier(0.16,1,0.3,1)";
    requestAnimationFrame(() => {
      heroFrame.style.opacity = "1";
      heroFrame.style.transform = "scale(1)";
    });
  }
});

// cursor parallax + tilt (fine pointer, motion allowed only)
if (heroMedia && finePointer && !reduceMotion) {
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
  const loop = () => {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    heroMedia.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    if (heroFrame) heroFrame.style.transform = `rotateX(${-cy * 0.12}deg) rotateY(${cx * 0.14}deg)`;
    if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) raf = requestAnimationFrame(loop);
    else raf = null;
  };
  window.addEventListener("mousemove", e => {
    const rx = (e.clientX / window.innerWidth - 0.5);
    const ry = (e.clientY / window.innerHeight - 0.5);
    tx = rx * 22; ty = ry * 16;
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
  if (heroFrame) heroFrame.style.transformStyle = "preserve-3d";
}

// activate the few light-catches once the hero is in view
if (!reduceMotion) {
  const sparkles = $$(".sparkle");
  const sio = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      sparkles.forEach(s => s.classList.toggle("go", entry.isIntersecting));
    });
  }, { threshold: 0.2 });
  const hf = $(".hero-frame");
  if (hf) sio.observe(hf);
}

/* =========================================================
   Custom cursor — a subtle follower that does NOT replace the
   native cursor (keeps pointers/carets intact for usability).
   ========================================================= */
if (finePointer && !reduceMotion) {
  const dot = $(".cursor-dot");
  if (dot) {
    let dx = 0, dy = 0, x = 0, y = 0, active = false, raf = null;
    const render = () => {
      x += (dx - x) * 0.2; y += (dy - y) * 0.2;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = (Math.abs(dx - x) > 0.1 || Math.abs(dy - y) > 0.1) ? requestAnimationFrame(render) : null;
    };
    window.addEventListener("mousemove", e => {
      dx = e.clientX; dy = e.clientY;
      if (!active) { active = true; dot.classList.add("active"); }
      if (!raf) raf = requestAnimationFrame(render);
    }, { passive: true });
    window.addEventListener("mouseout", e => { if (!e.relatedTarget) { active = false; dot.classList.remove("active"); } });
    document.addEventListener("mouseover", e => {
      const hot = e.target.closest("a, button, .piece, [role='button']");
      dot.classList.toggle("hot", !!hot);
    });
  }
}

/* =========================================================
   Instagram — wire up only if a real URL is configured.
   ========================================================= */
$$("[data-instagram]").forEach(a => {
  if (CONFIG.instagram) {
    a.href = CONFIG.instagram;
    a.target = "_blank";
    a.rel = "noopener";
  } else {
    a.removeAttribute("href");
    a.setAttribute("role", "link");
    a.setAttribute("aria-disabled", "true");
    a.title = "Instagram — coming soon";
    a.style.cursor = "default";
    a.style.opacity = "0.8";
  }
});

/* =========================================================
   Cal.com inline embed — loads only when CONFIG.calLink is set.
   Until then the styled preview / setup state remains visible.
   ========================================================= */
(function initScheduler() {
  const mount = $("#cal-inline");
  const preview = $("#cal-preview");
  if (!mount || !CONFIG.calLink) return; // keep the polished preview

  preview && (preview.style.display = "none");
  mount.hidden = false;

  // Official Cal.com embed loader
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
  Cal("inline", {
    elementOrSelector: "#cal-inline",
    calLink: CONFIG.calLink,
    layout: "month_view"
  });
  // Match the Chloe palette as closely as the embed allows
  Cal("ui", {
    theme: "light",
    cssVarsPerTheme: {
      light: {
        "cal-brand": "#4C1423",
        "cal-text": "#272223",
        "cal-bg": "#F7F4F4",
        "cal-bg-muted": "#F1E9E1",
        "cal-border": "rgba(76,20,35,0.16)"
      }
    },
    hideEventTypeDetails: false
  });
})();
