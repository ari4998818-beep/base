/* Bright Sky Management — light interactivity (no dependencies) */
(function () {
  'use strict';

  /* ---- Current year in footer ---- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Testimonials carousel ---- */
  var testimonials = [
    {
      text: "My kids have a safe place to play, the building is always clean, and when I call about something, someone actually picks up. That means the world.",
      name: "David R.",
      meta: "Affordable Housing Resident · Bronx, NY"
    },
    {
      text: "After my husband passed, I worried about managing on my own. The team here checks in, fixes things fast, and treats me like family. I never feel forgotten.",
      name: "Eleanor M.",
      meta: "Senior Living Resident · Hartford, CT"
    },
    {
      text: "We toured a dozen buildings before this one. The difference was the people — responsive, honest, and genuinely proud of the community they run.",
      name: "Priya & James T.",
      meta: "Market-Rate Apartment · Jersey City, NJ"
    }
  ];

  var textEl = document.getElementById('quote-text');
  var nameEl = document.getElementById('quote-name');
  var metaEl = document.getElementById('quote-meta');
  var avatarEl = document.getElementById('quote-avatar');
  var dotsEl = document.getElementById('dots');
  var index = 0;

  if (textEl && dotsEl) {
    testimonials.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Testimonial ' + (i + 1));
      if (i === 0) dot.setAttribute('aria-current', 'true');
      dot.addEventListener('click', function () { go(i); });
      dotsEl.appendChild(dot);
    });

    function render() {
      var t = testimonials[index];
      textEl.textContent = t.text;
      nameEl.textContent = t.name;
      metaEl.textContent = t.meta;
      avatarEl.textContent = t.name.charAt(0);
      Array.prototype.forEach.call(dotsEl.children, function (d, i) {
        if (i === index) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
    }

    function go(i) {
      index = (i + testimonials.length) % testimonials.length;
      render();
    }

    var prev = document.getElementById('prev');
    var next = document.getElementById('next');
    if (prev) prev.addEventListener('click', function () { go(index - 1); });
    if (next) next.addEventListener('click', function () { go(index + 1); });
  }

  /* ---- Mobile menu toggle ---- */
  var navToggle = document.getElementById('nav-toggle');
  var navLinks = document.getElementById('nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
      }
    });
  }

  /* ---- Community tabs (visual selection) ---- */
  var tabs = document.querySelectorAll('.tab');
  Array.prototype.forEach.call(tabs, function (tab) {
    tab.addEventListener('click', function () {
      Array.prototype.forEach.call(tabs, function (t) { t.setAttribute('aria-selected', 'false'); });
      tab.setAttribute('aria-selected', 'true');
    });
  });

  /* ---- Contact form (client-side feedback only) ---- */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  if (form && status) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('name').value.trim();
      var email = document.getElementById('email').value.trim();
      var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!name || !validEmail) {
        status.style.color = '#DC2626';
        status.textContent = 'Please add your name and a valid email so we can reach you.';
        return;
      }
      status.style.color = 'var(--blue)';
      status.textContent = 'Thanks, ' + name + '! A real person will get back to you shortly.';
      form.reset();
    });
  }
})();
