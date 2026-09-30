/*
 * ─────────────────────────────────────────────────────────────
 *  PAGE SHOWROOM
 *  Pour afficher des photos du showroom, ajoutez-les ci-dessous
 *  (la section « Le showroom en vrai » apparaît automatiquement) :
 *    "images/showroom/showroom-1.jpg",
 * ─────────────────────────────────────────────────────────────
 */
const SHOWROOM_PHOTOS = [];

// Catalogues : PDF et couvertures fournis par projects.js (généré ; bascule dans site.config.js)
const DOCS = window.EMBI_DOCS || {}, SIMG = window.EMBI_SITE_IMG || {};
const SHOWROOM_CATALOGUES = [
  { name: "Azulev", kind: "Carrelage", cover: SIMG["catalogue-azulev"], href: DOCS.azulev },
  { name: "Cifre", kind: "Carrelage", cover: SIMG["catalogue-cifre"], href: DOCS.cifre },
  { name: "Novaceram", kind: "Carrelage", cover: SIMG["catalogue-novaceram"], href: DOCS.novaceram },
  { name: "Recer", kind: "Carrelage", cover: SIMG["catalogue-recer"], href: DOCS.recer },
  { name: "Boxer", kind: "Site de la marque", cover: SIMG["catalogue-boxer"], href: "http://www.boxer.it", wide: true },
];

/* ───── En-tête, menu mobile, progression, apparitions ───── */
(() => {
  const $ = (s) => document.querySelector(s);
  $("#year").textContent = new Date().getFullYear();
  document.body.classList.add("is-loaded");
  const header = $("#header"), hero = $("#srHero"), progress = $("#progress"), nav = $("#nav"), burger = $("#burger");
  let lastY = 0, heroH = 0, docH = 0, ticking = false;
  const measure = () => { heroH = hero.offsetHeight; docH = document.documentElement.scrollHeight - innerHeight; };
  const onScroll = () => {
    ticking = false;
    if (document.body.classList.contains("menu-open")) return; // en-tête figé pendant que le menu est ouvert
    const y = scrollY;
    header.classList.toggle("is-scrolled", y > 20);
    header.classList.toggle("on-dark", y < heroH - 60);
    header.classList.toggle("is-hidden", y > 400 && y > lastY && !nav.classList.contains("is-open"));
    lastY = y;
    progress.style.transform = `scaleX(${docH > 0 ? Math.min(y / docH, 1) : 0})`;
  };
  // un seul calcul par image affichée ; hauteurs mesurées au chargement et au redimensionnement
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", () => { measure(); onScroll(); }, { passive: true });
  addEventListener("load", measure);
  new ResizeObserver(measure).observe(document.body);
  measure();
  onScroll();
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    window.EMBI_MENU_LOCK(open);
  };
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); burger.focus(); } });
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  const io = new IntersectionObserver((en) => en.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();

/* ───── Catalogues + photos ───── */
(() => {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const grid = document.getElementById("srCatalogues");
  grid.innerHTML = SHOWROOM_CATALOGUES.map((c, k) => `
    <a class="sr-book${c.wide ? " sr-book--wide" : ""} reveal" style="--i:${k}" href="${esc(c.href)}" target="_blank" rel="noopener">
      <span class="sr-book__cover"><img src="${esc(c.cover)}" alt="Catalogue ${esc(c.name)}" loading="lazy" /><span class="sr-book__fallback" aria-hidden="true">${esc(c.name)}</span></span>
      <span class="sr-book__meta"><strong>${esc(c.name)}</strong><span>${esc(c.kind)}</span><i aria-hidden="true">↗</i></span>
    </a>`).join("");
  grid.querySelectorAll("img").forEach((im) => {
    const miss = () => im.closest(".sr-book").classList.add("no-img");
    if (im.complete && !im.naturalWidth) miss(); else im.addEventListener("error", miss);
  });
  const io = new IntersectionObserver((en) => en.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { threshold: 0.12 });
  grid.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  if (!SHOWROOM_PHOTOS.length) return;
  const sec = document.getElementById("srPhotosSec"), gal = document.getElementById("srPhotos");
  sec.hidden = false;
  gal.innerHTML = SHOWROOM_PHOTOS.map((src, k) => `<button type="button" class="pj-shot" data-k="${k}" aria-label="Agrandir la photo ${k + 1}"><img src="${esc(src)}" alt="Showroom EMBI, photo ${k + 1}" loading="lazy" /></button>`).join("");
  gal.classList.toggle("is-single", SHOWROOM_PHOTOS.length === 1);
  const lb = document.getElementById("lb"), lbImg = document.getElementById("lbImg");
  let cur = 0, lastFocus = null;
  const show = (k) => {
    cur = (k + SHOWROOM_PHOTOS.length) % SHOWROOM_PHOTOS.length;
    lbImg.src = SHOWROOM_PHOTOS[cur];
    lbImg.alt = `Showroom EMBI, photo ${cur + 1}`;
    document.getElementById("lbCount").textContent = `${cur + 1} / ${SHOWROOM_PHOTOS.length}`;
    document.getElementById("lbPrev").hidden = document.getElementById("lbNext").hidden = SHOWROOM_PHOTOS.length < 2;
  };
  const close = () => { lb.hidden = true; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); };
  gal.addEventListener("click", (e) => { const b = e.target.closest(".pj-shot"); if (!b) return; lastFocus = b; show(+b.dataset.k); lb.hidden = false; document.body.style.overflow = "hidden"; });
  document.getElementById("lbClose").addEventListener("click", close);
  document.getElementById("lbPrev").addEventListener("click", () => show(cur - 1));
  document.getElementById("lbNext").addEventListener("click", () => show(cur + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(cur - 1);
    if (e.key === "ArrowRight") show(cur + 1);
  });
})();

/* ───── Animations : mur de carreaux (hero) et parquet qui se pose ───── */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  /* Motifs de carreaux (illustrations, dessinés en SVG 100 × 100) */
  const P = {
    ciment: ["Effet carreau de ciment", () => `<rect width="100" height="100" fill="#efe7da"/><path d="M0 0h30a30 30 0 0 1-30 30zM100 0v30a30 30 0 0 1-30-30zM100 100h-30a30 30 0 0 1 30-30zM0 100v-30a30 30 0 0 1 30 30z" fill="#1c1b19"/><path d="M50 22 78 50 50 78 22 50z" fill="#ff5a1f"/><circle cx="50" cy="50" r="9" fill="#efe7da"/>`],
    terrazzo: ["Effet terrazzo", () => {
      let s = `<rect width="100" height="100" fill="#e9e1d4"/>`;
      const cols = ["#ff5a1f", "#1c1b19", "#b9a78e", "#8a9a82", "#fff"];
      for (let i = 0; i < 26; i++) {
        const x = rnd() * 100, y = rnd() * 100, r = 2 + rnd() * 5;
        const pts = [0, 1, 2, 3, 4].map((k) => { const a = (k / 5) * 6.28 + rnd(); return `${(x + Math.cos(a) * r * (0.6 + rnd() * 0.5)).toFixed(1)},${(y + Math.sin(a) * r * (0.6 + rnd() * 0.5)).toFixed(1)}`; });
        s += `<polygon points="${pts.join(" ")}" fill="${cols[i % cols.length]}"/>`;
      }
      return s;
    }],
    tomette: ["Effet tomette", () => {
      let s = `<rect width="100" height="100" fill="#e6d2bf"/>`;
      const h = (cx, cy, c) => `<polygon points="${[0, 1, 2, 3, 4, 5].map((k) => { const a = (k / 6) * 6.283 + 0.5236; return `${(cx + Math.cos(a) * 27).toFixed(1)},${(cy + Math.sin(a) * 27).toFixed(1)}`; }).join(" ")}" fill="${c}"/>`;
      const c = ["#b5552f", "#c2643b", "#a94c29"];
      [[0, 0], [48, 0], [96, 0], [24, 41], [72, 41], [0, 82], [48, 82], [96, 82]].forEach(([x, y], i) => (s += h(x, y, c[i % 3])));
      return s;
    }],
    marbre: ["Effet marbre", () => `<rect width="100" height="100" fill="#f4f1ec"/><path d="M-5 30C20 22 30 48 55 40S85 12 105 20" fill="none" stroke="#b9b2a8" stroke-width="1.4"/><path d="M-5 72C15 60 38 80 60 66S88 52 105 60" fill="none" stroke="#cfc8be" stroke-width="2.4"/><path d="M30 -5C34 20 22 36 40 52S46 86 38 105" fill="none" stroke="#a79f94" stroke-width=".8"/>`],
    chevron: ["Effet parquet chevron", () => {
      let s = `<rect width="100" height="100" fill="#8a5a32"/>`;
      const w = ["#c89763", "#b98552", "#d4a673", "#a87644"];
      for (let r = -1; r < 5; r++) {
        s += `<polygon points="0,${r * 25} 50,${r * 25 + 25} 50,${r * 25 + 49} 0,${r * 25 + 24}" fill="${w[(r + 4) % 4]}"/>`;
        s += `<polygon points="100,${r * 25} 50,${r * 25 + 25} 50,${r * 25 + 49} 100,${r * 25 + 24}" fill="${w[(r + 6) % 4]}"/>`;
      }
      return s;
    }],
    metro: ["Effet métro", () => {
      let s = `<rect width="100" height="100" fill="#cfc9c0"/>`;
      for (let r = 0; r < 5; r++) for (let c = -1; c < 3; c++) s += `<rect x="${c * 50 + (r % 2 ? 25 : 0) + 1.5}" y="${r * 20 + 1.5}" width="47" height="17" rx="2" fill="#fbf8f3"/>`;
      return s;
    }],
    zellige: ["Effet zellige", () => {
      let s = `<rect width="100" height="100" fill="#dfe3dc"/>`;
      const c = ["#2f5d62", "#356b6f", "#28525a", "#3d7478"];
      for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) s += `<rect x="${q * 25 + 1}" y="${r * 25 + 1}" width="23" height="23" rx="1.5" fill="${c[(r * 3 + q) % 4]}"/><path d="M${q * 25 + 5} ${r * 25 + 7}h9" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/>`;
      return s;
    }],
    damier: ["Effet damier", () => {
      let s = `<rect width="100" height="100" fill="#f3efe8"/>`;
      for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) if ((r + q) % 2) s += `<rect x="${q * 25}" y="${r * 25}" width="25" height="25" fill="#1c1b19"/>`;
      return s;
    }],
    pierre: ["Effet pierre", () => `<rect width="100" height="100" fill="#d8ccb8"/><rect x="2" y="2" width="96" height="46" fill="#ded3c1"/><rect x="2" y="52" width="46" height="46" fill="#d2c5b0"/><rect x="52" y="52" width="46" height="46" fill="#dbcfbc"/><circle cx="24" cy="18" r="1.4" fill="#b9aa92"/><circle cx="70" cy="30" r="1" fill="#b9aa92"/><circle cx="30" cy="80" r="1.2" fill="#b9aa92"/><circle cx="80" cy="66" r="1.6" fill="#c3b49c"/>`],
  };
  const keys = Object.keys(P);
  const svgOf = (k) => `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${P[k][1]()}</svg>`;

  const wall = document.getElementById("srTiles"), label = document.getElementById("srTileName");
  if (wall) {
    const N = 16, tiles = [];
    for (let i = 0; i < N; i++) {
      const k = keys[(i * 5) % keys.length];
      const b = document.createElement("button");
      b.type = "button";
      b.className = "sr-tile";
      b.style.setProperty("--i", i);
      b.innerHTML = `<span class="sr-tile__in"><span class="sr-tile__face">${svgOf(k)}</span><span class="sr-tile__face sr-tile__face--back"></span></span>`;
      b.setAttribute("aria-label", P[k][0]);
      wall.appendChild(b);
      tiles.push({ b, k, flipped: false });
    }
    const flip = (t, show = true) => {
      let k;
      do k = keys[Math.floor(rnd() * keys.length)]; while (k === t.k);
      const faces = t.b.querySelectorAll(".sr-tile__face");
      faces[t.flipped ? 0 : 1].innerHTML = svgOf(k);
      t.flipped = !t.flipped;
      t.k = k;
      t.b.classList.toggle("is-flipped", t.flipped);
      t.b.setAttribute("aria-label", P[k][0]);
      if (show) label.textContent = P[k][0];
    };
    tiles.forEach((t) => {
      t.b.addEventListener("mouseenter", () => { label.textContent = P[t.k][0]; });
      t.b.addEventListener("click", () => flip(t));
    });
    requestAnimationFrame(() => wall.classList.add("is-in"));
    if (!reduce) {
      let busy = false;
      wall.addEventListener("mouseenter", () => (busy = true));
      wall.addEventListener("mouseleave", () => (busy = false));
      let wallOn = true;
      new IntersectionObserver((en) => (wallOn = en[0].isIntersecting)).observe(wall);
      setInterval(() => { if (wallOn && !busy && !document.hidden) flip(tiles[Math.floor(rnd() * N)]); }, 1700);
    }
  }

  /* Parquet en point de Hongrie : les lames se posent une à une depuis un angle */
  const svg = document.getElementById("srFloor");
  if (!svg) return;
  const W = 600, H = 440, L = 120, w = 30, woods = ["#c89763", "#b98552", "#d4a673", "#a87644", "#c28d59", "#dcb07c"];
  el("rect", { width: W, height: H, fill: "#6e4424" }, svg);
  const g = el("g", { transform: `translate(${W / 2} ${H / 2}) rotate(45)` }, svg);
  const planks = [];
  const R = 460;
  for (let i = -24; i <= 24; i++) {
    for (let j = -6; j <= 6; j++) {
      const ox = i * w + j * L, oy = i * w - j * L;
      [[ox, oy, L, w], [ox, oy + w, w, L]].forEach(([x, y, pw, ph]) => {
        const cx = x + pw / 2, cy = y + ph / 2;
        const sx = (cx - cy) * 0.7071, sy = (cx + cy) * 0.7071;
        if (Math.abs(sx) > W / 2 + 90 || Math.abs(sy) > H / 2 + 90) return;
        planks.push({ x, y, pw, ph, d: sx - sy + (rnd() * 40) });
      });
    }
  }
  planks.sort((a, b) => a.d - b.d);
  const shadow = el("g", {}, g);
  planks.forEach((p, k) => {
    p.r = el("rect", { x: p.x + 1, y: p.y + 1, width: p.pw - 2, height: p.ph - 2, rx: 1.5, fill: woods[Math.floor(rnd() * woods.length)], class: "sr-plank" }, shadow);
    const horiz = p.pw > p.ph;
    for (let s = 1; s < 3; s++) {
      const t = s / 3;
      el("path", { d: horiz ? `M${p.x + 6} ${p.y + p.ph * t} h${p.pw - 12}` : `M${p.x + p.pw * t} ${p.y + 6} v${p.ph - 12}`, stroke: "#000", "stroke-opacity": 0.07, "stroke-width": 1, fill: "none", class: "sr-grain" }, shadow);
    }
    p.k = k;
  });
  const grains = svg.querySelectorAll(".sr-grain");
  const count = document.getElementById("srFloorN");
  let raf = 0;
  const play = () => {
    cancelAnimationFrame(raf);
    const n = planks.length, dur = reduce ? 1 : 3200, t0 = performance.now();
    planks.forEach((p) => p.r.classList.remove("is-down"));
    grains.forEach((gr) => gr.classList.remove("is-down"));
    const step = (now) => {
      const upto = Math.min(n, Math.floor(((now - t0) / dur) * n));
      for (let k = 0; k < upto; k++) if (!planks[k].down) { planks[k].down = true; planks[k].r.classList.add("is-down"); grains[k * 2].classList.add("is-down"); grains[k * 2 + 1].classList.add("is-down"); }
      count.textContent = upto;
      if (upto < n) raf = requestAnimationFrame(step);
    };
    planks.forEach((p) => (p.down = false));
    raf = requestAnimationFrame(step);
  };
  const box = svg.closest("[data-floor]");
  new IntersectionObserver((en, o) => en.forEach((e) => { if (e.isIntersecting) { play(); o.disconnect(); } }), { threshold: 0.35 }).observe(box);
  document.getElementById("srFloorReplay").addEventListener("click", play);
})();
