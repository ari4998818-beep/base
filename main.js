/* =============================================================
   CHLOE JEWELERS — Interactions
   No frameworks, no build step. Progressive enhancement only.
   ============================================================= */

const CONFIG = {
  /* Cal.com event path "username/event-slug". When set, the live Cal.com
     inline embed replaces the custom scheduler, and "Continue" opens the real
     booking flow. Leave EMPTY to keep the custom scheduler; "Continue" then
     opens a pre-filled appointment-request email (a real request, never a fake
     confirmation). Booking questions — name, phone, email, and the optional
     "What are you looking for?" — are configured on the Cal.com event type. */
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

/* Sticky nav shadow */
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

/* Smooth anchor scrolling */
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
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); } });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach(el => io.observe(el));

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

/* Hero light-catches */
if (!reduceMotion) setTimeout(() => $$(".sparkle").forEach(s => s.classList.add("go")), 2000);

/* Subtle cursor parallax on the hero photo */
if (finePointer && !reduceMotion) {
  const photo = $(".hero-right img");
  const hero = $(".hero-right");
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
  const loop = () => {
    cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
    if (photo) photo.style.transform = `scale(1.05) translate(${cx * 0.5}px, ${cy * 0.5}px)`;
    raf = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) ? requestAnimationFrame(loop) : null;
  };
  hero && hero.addEventListener("mousemove", e => {
    const r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 22;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 16;
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
}

/* ============================================================
   SCHEDULER — custom calendar (real dates) + honest "Continue"
   ============================================================ */
(function scheduler() {
  const scEl = $("#scheduler");
  const calGrid = $(".cal-grid");
  const monthLabel = $("#cal-month");
  const prevBtn = $("#cal-prev");
  const nextBtn = $("#cal-next");
  if (!scEl || !calGrid) return;

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let view = new Date(minMonth);
  let selectedDate = null;
  let selectedSlot = null;

  const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  function render() {
    monthLabel.textContent = `${MONTHS[view.getMonth()]} ${view.getFullYear()}`;
    prevBtn.disabled = (view.getFullYear() === minMonth.getFullYear() && view.getMonth() === minMonth.getMonth());

    // remove old day cells (keep the 7 weekday headers)
    $$(".cal-day, .cal-pad", calGrid).forEach(n => n.remove());

    const year = view.getFullYear(), month = view.getMonth();
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDow; i++) {
      const pad = document.createElement("span");
      pad.className = "cal-pad"; pad.setAttribute("aria-hidden", "true");
      calGrid.appendChild(pad);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const btn = document.createElement("button");
      btn.className = "cal-day";
      btn.textContent = d;
      btn.type = "button";
      if (date < today) {
        btn.classList.add("past");
        btn.disabled = true;
        btn.setAttribute("aria-hidden", "true");
      } else {
        const label = date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
        btn.setAttribute("aria-label", label);
        if (sameDay(date, selectedDate)) { btn.classList.add("sel"); btn.setAttribute("aria-pressed", "true"); }
        btn.addEventListener("click", () => {
          selectedDate = date;
          render();
        });
      }
      calGrid.appendChild(btn);
    }
  }

  prevBtn.addEventListener("click", () => {
    const m = new Date(view.getFullYear(), view.getMonth() - 1, 1);
    if (m >= minMonth) { view = m; render(); }
  });
  nextBtn.addEventListener("click", () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); render(); });

  // default selection: next upcoming day
  selectedDate = new Date(today);
  render();

  // time slots
  const slots = $$("[data-slot]");
  slots.forEach(slot => slot.addEventListener("click", () => {
    slots.forEach(s => { s.classList.remove("sel"); s.removeAttribute("aria-pressed"); });
    slot.classList.add("sel"); slot.setAttribute("aria-pressed", "true");
    selectedSlot = slot.textContent.trim();
  }));

  // Continue — real action, never a fake confirmation
  $("#sched-continue").addEventListener("click", () => {
    const dateStr = selectedDate
      ? selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })
      : "";
    const timeStr = selectedSlot || "";

    if (CONFIG.calLink) {
      // hand off to the real Cal.com booking, pre-navigated to the chosen date
      const iso = selectedDate ? selectedDate.toISOString().slice(0, 10) : "";
      const url = `https://cal.com/${CONFIG.calLink}` + (iso ? `?date=${iso}&month=${iso.slice(0,7)}` : "");
      window.open(url, "_blank", "noopener");
      return;
    }
    // otherwise compose a genuine appointment-request email
    const subject = "Private Jewelry Appointment request";
    const body =
      `Hello Chloe Jewelers,\n\nI'd like to request a private jewelry appointment.` +
      (dateStr ? `\n\nPreferred date: ${dateStr}` : "") +
      (timeStr ? `\nPreferred time: ${timeStr}` : "") +
      `\n\nName:\nPhone:\nWhat I'm looking for (optional):\n\nThank you.`;
    window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();

/* ============================================================
   Optional Cal.com inline embed (only if CONFIG.calLink is set)
   ============================================================ */
(function calEmbed() {
  const mount = $("#cal-inline");
  const scEl = $("#scheduler");
  if (!mount || !CONFIG.calLink) return;

  scEl && (scEl.style.display = "none");
  mount.style.minHeight = "600px";

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
    cssVarsPerTheme: { light: { "cal-brand": "#4C1423", "cal-text": "#272223", "cal-bg": "#F7F4F4", "cal-bg-muted": "#F1E9E1", "cal-border": "rgba(76,20,35,0.16)" } },
    hideEventTypeDetails: false
  });
})();
