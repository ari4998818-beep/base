import * as store from '../store.js';
import { t, tc, lang } from '../i18n.js';
import { esc, $, $$, icon, card, tile, fmt, arrow, img, hydrate } from '../ui.js';
import { galleryHTML, bindGallery, bandHTML, zoom, FILTERS, STYLES } from './home.js';

/* ---------------- Explore + Search ---------------- */

export function renderExplore(root, params) {
  const q = params.get('q');
  const f = params.get('f');
  if (q) {
    const items = store.list({ q });
    root.innerHTML = `<section class="section page-head">
      <p class="eyebrow">${t('search.results')}</p>
      <h1 class="display-xl">“${esc(q)}”</h1>
      <p class="muted">${items.length} ${items.length === 1 ? t('src.sukkah') : t('src.sukkahs')}</p>
    </section>
    <section class="section gallery"><div class="masonry">${items.length ? items.map(tile).join('') : `<p class="empty">${t('search.none')}</p>`}</div></section>`;
    return;
  }
  const active = FILTERS.includes(f) ? f : STYLES.some(([c]) => c === f) ? f : 'Trending';
  const extra = FILTERS.includes(active) ? '' : active; // e.g. Balcony isn't a chip, still filter by it
  root.innerHTML = `<section class="section page-head">
      <p class="eyebrow">${t('gallery.eyebrow')}</p>
      <h1 class="display-xl">${t('nav.explore')}${extra ? ` <span class="hl">${esc(tc(extra))}</span>` : ''}</h1>
    </section>
    ${extra ? `<section class="section gallery"><div class="masonry">${store.list({ category: extra, sort: 'voted' }).map(tile).join('') || `<p class="empty">${t('gallery.empty')}</p>`}</div></section>` : galleryHTML(active, { heading: false })}
    ${bandHTML()}`;
  bindGallery(root, (nf) => history.replaceState(null, '', `#/explore?f=${encodeURIComponent(nf)}`));
}

/* ---------------- Sukkah Sources ---------------- */

export function renderSources(root, params, key) {
  const all = store.products();
  if (key) return renderProduct(root, all.find((p) => p.key === key));
  const shelf = params.get('c') || '';
  const cats = store.SOURCE_CATEGORIES.filter((c) => all.some((p) => p.shelf === c));
  const items = shelf ? all.filter((p) => p.shelf === shelf) : all;
  root.innerHTML = `<section class="section page-head split-head">
      <div><p class="eyebrow">${t('src.eyebrow')}</p><h1 class="display-xl">${t('src.h1')}<br><span class="hl">${t('src.h2')}</span></h1></div>
      <p class="muted split-aside">${t('src.sub')}</p>
    </section>
    <section class="section sources">
      <div class="chips">
        <a class="chip ${!shelf ? 'on' : ''}" href="#/sources">${t('src.all')} <em>${all.length}</em></a>
        ${store.SOURCE_CATEGORIES.map((c) => `<a class="chip ${shelf === c ? 'on' : ''} ${cats.includes(c) ? '' : 'dim'}" href="#/sources?c=${encodeURIComponent(c)}">${esc(c)} <em>${all.filter((p) => p.shelf === c).length}</em></a>`).join('')}
      </div>
      <div class="source-grid">
        ${items.map((p, i) => `<a class="source ${i % 5 === 0 ? 'big' : ''}" href="#/sources/${p.key}">
          ${zoom(p.seen[0], i % 5 === 0 ? 'big' : '')}
          <span class="src-meta">
            <em class="p-cat">${esc(p.shelf)}</em>
            <strong>${esc(p.name)}</strong>
            <span>${esc(p.vendor || '')}${p.price ? ` · ${esc(p.price)}` : ''}</span>
            <span class="seen">${t('src.seenIn')} ${p.seen.length} ${p.seen.length === 1 ? t('src.sukkah') : t('src.sukkahs')}</span>
          </span>
        </a>`).join('') || `<p class="empty">${t('gallery.empty')}</p>`}
      </div>
    </section>`;
  hydrate(root);
}

function renderProduct(root, p) {
  if (!p) { root.innerHTML = `<section class="section notfound"><h1 class="display">${t('detail.notFound')}</h1><a class="btn btn-dark" href="#/sources">${t('src.eyebrow')}</a></section>`; return; }
  document.title = `${p.name} · Sukkah Sources`;
  root.innerHTML = `<section class="section product-page">
      <a class="back-link" href="#/sources?c=${encodeURIComponent(p.shelf)}"><span aria-hidden="true">${arrow() === '→' ? '←' : '→'}</span> ${esc(p.shelf)}</a>
      <div class="pp-grid">
        <div class="pp-media">${zoom(p.seen[0], 'big')}</div>
        <div class="pp-info">
          <p class="eyebrow">${esc(p.category)}</p>
          <h1 class="display">${esc(p.name)}</h1>
          <p class="pp-vendor">${esc(p.vendor || '')}${p.price ? ` <b>${esc(p.price)}</b>` : ''}</p>
          ${p.note ? `<p class="p-note big">“${esc(p.note)}”</p>` : ''}
          ${p.url ? `<a class="btn btn-lime btn-lg" href="${esc(p.url)}" target="_blank" rel="noopener nofollow">${t('detail.view')} <span aria-hidden="true">${arrow()}</span></a>` : ''}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="tabs-row"><h2 class="eyebrow">${t('src.seenInThese')} · ${p.seen.length}</h2></div>
      <div class="cards rail">${p.seen.map((x) => card(x.sukkah)).join('')}</div>
    </section>`;
  hydrate(root);
}

/* ---------------- Winners ---------------- */

export function renderWinners(root) {
  const picks = store.list().filter((s) => s.editorsPick);
  const board = store.list({ sort: 'voted' }).slice(0, 10);
  root.innerHTML = `<section class="section page-head split-head">
      <div><p class="eyebrow">${t('win.eyebrow')}</p><h1 class="display-xl">${t('win.h1')}<br><span class="hl">${t('win.h2')}</span></h1></div>
      <p class="muted split-aside">${esc(store.settings().contestLine)}</p>
    </section>
    ${picks.length ? `<section class="section"><div class="tabs-row"><h2 class="eyebrow">${t('win.picks')}</h2></div><div class="cards rail">${picks.map(card).join('')}</div></section>` : ''}
    <section class="section">
      <div class="tabs-row"><h2 class="eyebrow">${t('win.board')}</h2></div>
      <ol class="board">
        ${board.map((s, i) => `<li>
          <span class="rank">${String(i + 1).padStart(2, '0')}</span>
          <a class="board-img" href="#/sukkah/${s.slug}">${img(store.coverOf(s).src, s.title, 'loading="lazy"')}</a>
          <a class="board-title" href="#/sukkah/${s.slug}"><strong>${esc(s.title)}</strong><em>${esc(s.location)}</em></a>
          <button class="vote-chip ${store.hasVoted(s.id) ? 'is-voted' : ''}" data-vote="${s.id}">${icon.heart(store.hasVoted(s.id))}<span data-count>${fmt(s.votes)}</span></button>
        </li>`).join('')}
      </ol>
    </section>
    ${bandHTML()}`;
  hydrate(root);
}

/* ---------------- About ---------------- */

export function renderAbout(root) {
  const yi = lang === 'yi';
  root.innerHTML = `<section class="section page-head about">
      <p class="eyebrow">${t('about.eyebrow')}</p>
      <h1 class="display-xl">${yi ? 'יעדע סוכה<br>האט א <span class="hl">מעשה.</span>' : 'Every sukkah<br>has a <span class="hl">story.</span>'}</h1>
    </section>
    <section class="section about-body">
      <p class="serif-lede">${yi
        ? 'איינער האט געבויט פון אלטע פאלעטן. איינער האט אריינגעהאנגען א שאנדעליר. איינער האט געמאכט א סוכה אויפ׳ן דאך מיט די גאנצע שטאט ארום.'
        : 'Someone built theirs from old pallets. Someone hung a chandelier. Someone put theirs on a Brooklyn rooftop with the whole skyline for a wall.'}</p>
      <div class="about-cols">
        <p>${yi
          ? 'Inside the Sukkah איז א פלאץ צו זען די סוכות — נישט נאר די שיינסטע, נאר די וואס האבן א מעשה. מ׳קען כאפן אידעעס, שטימען פאר די וואס געפעלן אייך, און זען פונקט וואו מ׳האט יעדע לעמפ און יעדן טישטעך געקויפט.'
          : 'Inside the Sukkah is a place to look at sukkahs — not just the most expensive ones, but the ones with a story. Get ideas, vote for the ones you love, and see exactly where every lamp and tablecloth came from.'}</p>
        <p>${yi
          ? 'עס קאסט גארנישט און עס נעמט פינף מינוט. בילדער פון טעלעפאן זענען פונקט גוט.'
          : 'Sharing yours is free and takes about five minutes. Photos from your phone are perfect.'}</p>
      </div>
      <ol class="how">
        <li><span>01</span><h3>${yi ? 'שיקט אריין' : 'Share'}</h3><p>${yi ? 'לייגט ארויף ביז 8 בילדער.' : 'Upload up to eight photos of your sukkah.'}</p></li>
        <li><span>02</span><h3>${yi ? 'טאגט' : 'Tag'}</h3><p>${yi ? 'ווייזט וואו איר האט געקויפט.' : 'Show people where you found things.'}</p></li>
        <li><span>03</span><h3>${yi ? 'שטימט' : 'Vote'}</h3><p>${yi ? 'שיקט עס אין די משפחה גרופע.' : 'Send it to the family chat. Every vote counts.'}</p></li>
      </ol>
    </section>
    ${bandHTML()}`;
}
