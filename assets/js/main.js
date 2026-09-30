(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const projects = window.EMBI_PROJECTS || [];
  const cats = window.EMBI_CATEGORIES || {};
  const pad = (n) => String(n).padStart(2, "0");
  const esc = (str = "") =>
    str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  /* ───── Chargement : animation d'intro (une fois par visite, voir le script en tête de page) ───── */
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loader = $("#loader");
  const intro = !!loader && document.documentElement.classList.contains("intro") && !reduce;
  let loaded = false;
  const finishLoad = () => {
    if (loaded) return;
    loaded = true;
    if (loader) loader.classList.add("is-done");
    document.documentElement.classList.remove("intro-lock");
    setTimeout(() => {
      document.body.classList.add("is-loaded");
      document.dispatchEvent(new Event("embi:loaded"));
      if (loader && intro) setTimeout(() => loader.remove(), 1100);
    }, intro ? 250 : 0);
  };
  if (!intro) finishLoad();
  else {
    // compteur 0 → 100 %, le contenu de la page est déjà affiché dessous
    const t0 = performance.now(), count = $("#loaderCount");
    count.textContent = "0";
    const tick = (t) => {
      if (loaded) return;
      const k = Math.min((t - t0) / 3300, 1);
      count.textContent = Math.round(100 * (1 - Math.pow(1 - k, 3)));
      k < 1 ? requestAnimationFrame(tick) : finishLoad();
    };
    requestAnimationFrame(tick);
    setTimeout(finishLoad, 4800);
    loader.addEventListener("click", finishLoad);
    addEventListener("keydown", (e) => { if (e.key === "Escape") finishLoad(); });
    const skip = $("#loaderSkip");
    if (skip) { skip.addEventListener("click", (e) => { e.stopPropagation(); count.textContent = "100"; finishLoad(); }); skip.focus({ preventScroll: true }); }
    setTimeout(() => { const c = $("#loaderCaption"); if (c && !loaded) c.innerHTML = "embi. <span>Du plan à la réalité.</span>"; }, 2300);
  }
  $("#year").textContent = new Date().getFullYear();

  /* ───── Header ───── */
  const header = $("#header");
  const hero = $(".hero, .cs-hero, .pj-hero");
  if (hero) header.classList.add("on-dark");
  let lastY = 0, heroH = hero ? hero.offsetHeight : 0, docH = 0, ticking = false;
  const progress = $("#progress");
  const measure = () => { heroH = hero ? hero.offsetHeight : 0; docH = document.documentElement.scrollHeight - innerHeight; };
  // un seul calcul par image affichée (évite les recalculs de mise en page à chaque événement de défilement)
  const onScroll = () => {
    ticking = false;
    if (document.body.classList.contains("menu-open")) return; // en-tête figé pendant que le menu est ouvert
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 20);
    header.classList.toggle("on-dark", !!hero && y < heroH - 60);
    header.classList.toggle("is-hidden", y > 400 && y > lastY && !nav.classList.contains("is-open"));
    lastY = y;
    if (progress) progress.style.transform = `scaleX(${docH > 0 ? Math.min(y / docH, 1) : 0})`;
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", () => { measure(); onScroll(); }, { passive: true });
  window.addEventListener("load", measure);
  new ResizeObserver(measure).observe(document.body);
  measure();

  /* ───── Menu mobile ───── */
  const burger = $("#burger");
  const nav = $("#nav");
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    window.EMBI_MENU_LOCK(open);
  };
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); burger.focus(); } });
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ───── Marquee des références ───── */
  if ($("#marquee")) {
  const named = projects.filter((p) => p.category !== "particulier");
  const chunk = named.map((p, i) => `<a href="${window.EMBI_PROJECT_URL(p.id)}"><span class="${i % 2 ? "is-outline" : ""}">${esc(p.title)}</span></a><i aria-hidden="true"></i>`).join("");
  $("#marquee").innerHTML = chunk + chunk;
  const words2 = ["Rénovation intérieure", "Gros œuvre", "Plomberie", "Électricité", "Isolation", "Carrelage", "Parquet", "Façades", "Clé en main"];
  const chunk2 = words2.map((n) => `<span>${n}</span><i>·</i>`).join("");
  $("#marquee2").innerHTML = chunk2 + chunk2;
  }

  /* ───── Mot tournant du titre ───── */
  const rot = $("#rotator");
  if (rot) {
    const items = $$("span", rot);
    let r = 0;
    const size = () => (rot.style.width = items[r].offsetWidth + "px");
    document.fonts && document.fonts.ready.then(size);
    size();
    window.addEventListener("resize", size);
    if (!reduce)
      setInterval(() => {
        const prev = items[r];
        r = (r + 1) % items.length;
        prev.classList.remove("is-active");
        prev.classList.add("is-leaving");
        items[r].classList.remove("is-leaving");
        items[r].classList.add("is-active");
        size();
        setTimeout(() => prev.classList.remove("is-leaving"), 800);
      }, 2200);
  }

  // chaque chantier a sa page : realisations/<id>.html
  const pageOf = (i) => window.EMBI_PROJECT_URL(projects[i].id);
  const go = (i) => (location.href = pageOf(i));

  /* ───── Réalisations : filtres de la grille ───── */
  const grid = $("#grid");
  if (grid) {
    const cards = $$(".pj-card", grid);
    $$(".realisations-all .filter").forEach((btn) =>
      btn.addEventListener("click", () => {
        $$(".realisations-all .filter").forEach((b) => {
          b.classList.toggle("is-active", b === btn);
          b.setAttribute("aria-pressed", b === btn);
        });
        const f = btn.dataset.filter;
        cards.forEach((c) => (c.hidden = f !== "all" && c.dataset.cat !== f));
      })
    );
  }

  /* ───── Réalisations : liste en accordéon (écrite dans la page par scripts/build.js) ───── */
  const refsList = $("#refsList");
  if (refsList) {
    const accItems = $$(".acc__item", refsList);
    const openAcc = (li) => {
      accItems.forEach((x) => {
        const on = x === li;
        x.classList.toggle("is-open", on);
        $(".acc__head", x).setAttribute("aria-expanded", on);
      });
    };
    const refsFilters = $$(".refs .filter");
    refsFilters.forEach((btn) =>
      btn.addEventListener("click", () => {
        refsFilters.forEach((b) => {
          b.classList.toggle("is-active", b === btn);
          b.setAttribute("aria-pressed", b === btn);
        });
        const f = btn.dataset.filter;
        const keep = accItems.filter((li) => f === "all" || li.dataset.cat === f);
        accItems.forEach((li) => (li.hidden = !keep.includes(li)));
        openAcc(keep[0]);
      })
    );
    openAcc(accItems[0]);
    let accTimer = null;
    const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
    refsList.addEventListener("mouseover", (e) => {
      if (!canHover) return;
      const li = e.target.closest(".acc__item");
      if (!li || li.classList.contains("is-open")) return;
      clearTimeout(accTimer);
      accTimer = setTimeout(() => openAcc(li), 140); // petit délai : évite l'effet « accordéon nerveux »
    });
    refsList.addEventListener("mouseleave", () => clearTimeout(accTimer));
    refsList.addEventListener("click", (e) => {
      const head = e.target.closest(".acc__head");
      if (!head) return;
      const li = head.parentElement;
      // nom d'un chantier déjà ouvert : on va sur sa page (souris comme doigt)
      if (li.classList.contains("is-open")) return go(+head.dataset.i);
      // on garde le nom touché à la même place à l'écran pendant que la liste se réorganise,
      // puis on s'assure que la photo et « Voir le projet » sont visibles
      const top0 = head.getBoundingClientRect().top;
      openAcc(li);
      if (!canHover) {
        const keep = () => { const d = head.getBoundingClientRect().top - top0; if (Math.abs(d) > 1) window.scrollBy(0, d); };
        requestAnimationFrame(keep);
        const t0 = performance.now();
        const follow = () => { keep(); if (performance.now() - t0 < 750) requestAnimationFrame(follow); else { const r = li.getBoundingClientRect(); if (r.bottom > innerHeight - 16) window.scrollBy({ top: Math.min(r.bottom - innerHeight + 24, r.top - 90), behavior: reduce ? "auto" : "smooth" }); } };
        requestAnimationFrame(follow);
      }
    });
  }

  /* ───── Chantiers signature : écran partagé épinglé ───── */
  const feature = $("#selection");
  if (feature) {
  const featured = projects.map((p, i) => ({ p, i })).filter(({ p }) => p.featured).sort((a, b) => a.p.featured - b.p.featured);
  const fList = $("#featureList"), fFrame = $("#featureFrame");
  fList.innerHTML = featured
    .map(({ p }, k) => `<li><button type="button" data-k="${k}"><span class="n">${pad(k + 1)}</span><span class="t">${esc(p.title)}</span></button></li>`)
    .join("");
  fFrame.innerHTML = featured
    .map(({ p }, k) => `<figure class="feature__img" style="z-index:${k + 1}"><img src="${esc(p.images[0])}" alt="${esc(p.title)}, ${esc(({ hotel: "hôtel rénové", boutique: "boutique rénovée", restaurant: "restaurant rénové", particulier: "appartement rénové" })[p.category] || "lieu rénové")} par EMBI" loading="lazy" /><figcaption>${esc(cats[p.category] || "")}</figcaption></figure>`)
    .join("");
  $("#featureTotal").textContent = pad(featured.length);
  const fItems = $$("li", fList), fImgs = $$(".feature__img", fFrame), fRail = $("#featureRail");
  let fActive = -1;
  const setFeature = (k) => {
    if (k === fActive) return;
    fActive = k;
    fItems.forEach((li, j) => li.classList.toggle("is-active", j === k));
    fImgs.forEach((f, j) => f.classList.toggle("is-shown", j <= k));
    $("#featureNum").textContent = pad(k + 1);
  };
  // Défilement automatique : 5 s par projet, pause au survol / hors écran
  const DURATION = 5000;
  let fT0 = performance.now(), fElapsed = 0, fPaused = false, fInView = false;
  const goFeature = (k) => {
    setFeature((k + featured.length) % featured.length);
    fElapsed = 0;
    fT0 = performance.now();
  };
  const tickFeature = (t) => {
    const running = fInView && !fPaused && !reduce;
    if (running) {
      fElapsed += t - fT0;
      if (fElapsed >= DURATION) goFeature(fActive + 1);
    }
    fT0 = t;
    const part = reduce ? 0 : Math.min(fElapsed / DURATION, 1);
    fRail.style.transform = `scaleY(${(fActive + part) / featured.length})`;
    if (fInView && !document.hidden) requestAnimationFrame(tickFeature);
    else fLoop = false;
  };
  let fLoop = false;
  const startFeature = () => { if (!fLoop) { fLoop = true; fT0 = performance.now(); requestAnimationFrame(tickFeature); } };
  setFeature(0);
  // l'animation ne tourne que lorsque la section est à l'écran
  new IntersectionObserver((en) => { fInView = en[0].isIntersecting; if (fInView) startFeature(); }, { threshold: 0.4 }).observe(feature);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && fInView) startFeature(); });
  feature.addEventListener("mouseenter", () => (fPaused = true));
  feature.addEventListener("mouseleave", () => (fPaused = false));
  const openFeatured = (k) => go(featured[k].i);
  fList.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const k = +b.dataset.k;
    k === fActive ? openFeatured(k) : goFeature(k);
  });
  // survol : on ne change de chantier qu'après un court arrêt, pour qu'en descendant vers « Voir le projet »
  // la souris ne sélectionne pas au passage les chantiers suivants
  let fHover = null;
  fList.addEventListener("mouseover", (e) => {
    const b = e.target.closest("button");
    clearTimeout(fHover);
    if (b && matchMedia("(hover: hover)").matches && +b.dataset.k !== fActive) fHover = setTimeout(() => goFeature(+b.dataset.k), 220);
  });
  fList.addEventListener("mouseleave", () => clearTimeout(fHover));
  let fx = null;
  fFrame.addEventListener("touchstart", (e) => (fx = e.touches[0].clientX), { passive: true });
  fFrame.addEventListener("touchend", (e) => {
    if (fx === null) return;
    const dx = e.changedTouches[0].clientX - fx;
    fx = null;
    if (Math.abs(dx) > 40) goFeature(fActive + (dx < 0 ? 1 : -1));
  });
  fFrame.addEventListener("click", () => openFeatured(fActive));
  $("#featureOpen").addEventListener("click", () => openFeatured(fActive));
  }

  /* ───── Texte qui s'allume mot à mot ───── */
  $$("[data-words]").forEach((el) => {
    const wrap = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part.trim()) return frag.append(part);
            const sp = document.createElement("span");
            sp.className = "w";
            sp.textContent = part;
            frag.append(sp);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) wrap(n);
      });
    };
    wrap(el);
    const ws = $$(".w", el);
    const light = () => {
      const r = el.getBoundingClientRect();
      const k = Math.min(Math.max((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35), 0), 1);
      const n = Math.round(k * ws.length);
      ws.forEach((w, i) => w.classList.toggle("is-on", i < n));
    };
    let wTick = false, wOn = false;
    new IntersectionObserver((en) => { wOn = en[0].isIntersecting; if (wOn) light(); }).observe(el);
    window.addEventListener("scroll", () => { if (wOn && !wTick) { wTick = true; requestAnimationFrame(() => { wTick = false; light(); }); } }, { passive: true });
    light();
  });


  /* ───── Curseur personnalisé + boutons magnétiques ───── */
  if (matchMedia("(hover: hover) and (pointer: fine)").matches && !reduce) {
    const cur = $("#cursor"), label = $("#cursorLabel");
    let x = -100, y = -100, cxp = -100, cyp = -100, moving = false;
    const move = () => {
      cxp += (x - cxp) * 0.22;
      cyp += (y - cyp) * 0.22;
      cur.style.transform = `translate3d(${cxp}px, ${cyp}px, 0)`;
      // la boucle s'arrête quand le curseur a rejoint la souris
      if (Math.abs(x - cxp) + Math.abs(y - cyp) > 0.5) requestAnimationFrame(move);
      else moving = false;
    };
    document.addEventListener("mousemove", (e) => {
      x = e.clientX; y = e.clientY;
      if (!cur.classList.contains("is-on")) { cxp = x; cyp = y; cur.classList.add("is-on"); }
      if (!moving) { moving = true; requestAnimationFrame(move); }
    }, { passive: true });
    document.addEventListener("mouseleave", () => cur.classList.add("is-hidden"));
    document.addEventListener("mouseenter", () => cur.classList.remove("is-hidden"));
    document.addEventListener("mouseover", (e) => {
      const view = e.target.closest(".card, .feature__frame, .acc__img");
      const link = e.target.closest("a, button, input, textarea, label");
      cur.classList.toggle("is-view", !!view);
      cur.classList.toggle("is-link", !view && !!link);
      cur.classList.toggle("is-light", !!e.target.closest(".quiz, .urgent") && !e.target.closest(".quiz__card"));
      label.textContent = view ? "Voir" : "";
    });
    $$("[data-magnetic]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.35}px)`;
      });
      el.addEventListener("mouseleave", () => (el.style.transform = ""));
    });
  }

  /* ───── Logo géant qui réagit à la souris ───── */
  const big = $("#bigLogo");
  if (big && matchMedia("(pointer: fine)").matches && !reduce) {
    const chars = $$(".ch", big);
    const footer = $(".footer");
    footer.addEventListener("mousemove", (e) => {
      chars.forEach((c) => {
        const r = c.getBoundingClientRect();
        const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
        const k = Math.max(0, 1 - d / 420);
        c.style.fontVariationSettings = `"wght" ${Math.round(800 - k * 300)}`;
        c.classList.toggle("is-hot", k > 0.55);
      });
    });
    footer.addEventListener("mouseleave", () => chars.forEach((c) => { c.style.fontVariationSettings = ""; c.classList.remove("is-hot"); }));
  }

  /* ───── Apparition au scroll ───── */
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const siblings = [...en.target.parentElement.children].filter((c) => c.classList.contains("reveal"));
        en.target.style.transitionDelay = Math.min(siblings.indexOf(en.target), 6) * 70 + "ms";
        en.target.classList.add("is-in");
        io.unobserve(en.target);
      }),
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ───── Compteurs ───── */
  const countIO = new IntersectionObserver((entries) =>
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target, end = +el.dataset.count, t0 = performance.now();
      const tick = (t) => {
        const k = Math.min((t - t0) / 1400, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + (k === 1 ? "+" : "");
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    })
  );
  $$("[data-count]").forEach((el) => countIO.observe(el));

  /* ───── Savoir-faire : la maison et son plan qui se dessine ───── */
  if ($("#build")) {
  const BUILD = {
    fondations: { n: "01", label: "Fondations", title: "Gros œuvre & grands chantiers",
      text: "Construction de maison ou rénovation totale de locaux professionnels : notre expérience du terrain nous permet de prendre en charge les projets d'envergure.",
      tags: ["Structure métallique", "Structure bois", "Ouvertures de baies", "Normes coupe-feu"] },
    interieur: { n: "02", label: "Intérieur", title: "Rénovations intérieures",
      text: "Aménagement et rénovation d'intérieur, pour votre habitation (maison, appartement…) comme pour votre local professionnel (hôtel, restaurant, bureau, boutique…).",
      tags: ["Plomberie", "Électricité", "Revêtements muraux", "Isolation", "Décoration"] },
    exterieur: { n: "03", label: "Façades", title: "Façades & extérieurs",
      text: "Ravalement, menuiserie extérieure, portes et fenêtres, changement de revêtement, mais aussi balcons, galeries, patios, terrasses et vérandas.",
      tags: ["Ravalement", "Menuiserie", "Portes & fenêtres", "Balcons", "Vérandas"] },
    toit: { n: "04", label: "Toit", title: "Toitures & terrasses",
      text: "Toitures, étanchéité et carrelage de terrasse : EMBI intervient de la fondation jusqu'au toit.",
      tags: ["Toitures", "Étanchéité terrasse", "Carrelage de terrasse"] },
  };
  // plans techniques (repère 400 × 240) : w = murs, o = détails, d = cotes et terrain, t = légendes
  const hatch = Array.from({ length: 15 }, (_, i) => `M${24 + i * 25} 88 l-10 12`).join(" ");
  const PLANS = {
    fondations: [["d", "M10 80 H390"], ["d", hatch], ["w", "M130 16 V150"], ["w", "M270 16 V150"], ["w", "M130 98 H270"],
      ["w", "M100 150 H160 V192 H100 Z"], ["w", "M240 150 H300 V192 H240 Z"],
      ["o", "M108 180 H152 M108 168 H152 M248 180 H292 M248 168 H292"], ["o", "M137 150 V104 M263 150 V104"],
      ["d", "M100 214 H300 M100 208 v12 M300 208 v12"],
      ["t", "SEMELLE", 104, 206], ["t", "DALLE", 186, 92], ["t", "TERRAIN NATUREL", 298, 74]],
    interieur: [["w", "M40 30 H360 V210 H40 Z"], ["w", "M200 30 V110 M200 160 V210"], ["w", "M40 120 H130 M170 120 H200"], ["w", "M290 210 V150 H360"],
      ["o", "M170 120 V80 A40 40 0 0 0 130 120"], ["o", "M200 160 H250 A50 50 0 0 0 200 110"],
      ["o", "M60 140 h60 v50 h-60 Z M60 152 h60"], ["o", "M232 48 h96 v26 h-96 Z"], ["o", "M300 122 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0"],
      ["o", "M250 26 H330 M250 34 H330"], ["d", "M40 226 H360 M40 220 v12 M360 220 v12"],
      ["t", "CHAMBRE", 58, 108], ["t", "SÉJOUR", 256, 108], ["t", "SDB", 316, 196]],
    exterieur: [["d", "M20 214 H380"], ["w", "M90 214 V50 H300 V214"], ["w", "M90 132 H300"],
      ["w", "M118 70 h40 v40 h-40 Z M232 70 h40 v40 h-40 Z M118 152 h40 v44 h-40 Z M226 214 V152 h46 v62"],
      ["o", "M100 132 V114 H290 V132 M130 114 V132 M160 114 V132 M190 114 V132 M220 114 V132 M250 114 V132"],
      ["o", "M320 214 V40 M352 214 V40 M320 80 H352 M320 130 H352 M320 180 H352 M320 80 L352 130 M320 130 L352 180"],
      ["d", "M90 228 H300 M90 222 v12 M300 222 v12"], ["t", "ÉCHAFAUDAGE", 312, 32], ["t", "FAÇADE SUD", 160, 42]],
    toit: [["w", "M50 170 L200 50 L350 170 Z"], ["w", "M200 50 V170"], ["o", "M200 170 L125 110 M200 170 L275 110"],
      ["d", "M36 178 L200 40 L364 178"], ["w", "M270 92 V44 H300 V116"], ["o", "M30 180 h28 M342 180 h28"],
      ["d", "M50 204 H350 M50 198 v12 M350 198 v12"], ["t", "CHARPENTE", 166, 190], ["t", "COUVERTURE", 56, 96]],
  };
  // Maquette en axonométrie : 4 couches (fondations, rez-de-chaussée, étage, toit) générées ici
  (() => {
    const svg = $("#axoSvg");
    const NS = "http://www.w3.org/2000/svg";
    const C = Math.cos(Math.PI / 6), S = Math.sin(Math.PI / 6), K = 0.84, CX = 222, CY = 236;
    const W = 220, D = 160;
    svg.innerHTML = '<defs><pattern id="axoHatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#e3dacb"/><line x1="0" y1="0" x2="0" y2="7" stroke="#161513" stroke-width="1" opacity=".35"/></pattern></defs>';
    const P = (x, y, z) => [CX + (x - y) * C * K, CY + (x + y) * S * K - z * K];
    const el = (tag, attrs, parent) => {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      parent.appendChild(e);
      return e;
    };
    const pts = (list) => list.map((p) => P(...p).map((n) => n.toFixed(1)).join(",")).join(" ");
    const face = (g, list, cls = "face") => el("polygon", { points: pts(list), class: cls, pathLength: 1 }, g);
    const line = (g, list, cls = "edge") => el("polyline", { points: pts(list), class: cls, pathLength: 1 }, g);
    // boîte opaque : dessus + deux faces visibles (côtés x+w et y+d)
    const box = (g, x, y, z, w, d, h, cls = "face") => {
      face(g, [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], cls);
      face(g, [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], cls);
      face(g, [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], cls);
    };
    const layer = (z, label, lz) => {
      const g = el("g", { class: "bz", "data-z": z, tabindex: 0, role: "button", "aria-label": label }, svg);
      g.dataset.lz = lz;
      return el("g", { class: "bz__body" }, g);
    };

    // 1 · Fondations : dalle + semelles
    let g = layer("fondations", "Fondations", -14);
    box(g, 14, 14, -46, W - 28, 22, 20, "face face--dark");
    box(g, 14, D - 36, -46, W - 28, 22, 20, "face face--dark");
    box(g, 0, 0, -26, W, D, 26, "face face--hatch");

    // 2 · Intérieur (rez-de-chaussée ouvert) : murs du fond, cloisons, meubles, escalier
    g = layer("interieur", "Intérieur", 40);
    face(g, [[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]], "face face--floor");
    face(g, [[0, 0, 0], [0, D, 0], [0, D, 80], [0, 0, 80]]);
    face(g, [[0, 0, 0], [W, 0, 0], [W, 0, 80], [0, 0, 80]]);
    face(g, [[0, 30, 22], [0, 70, 22], [0, 70, 62], [0, 30, 62]], "face face--glass");
    face(g, [[120, 0, 22], [170, 0, 22], [170, 0, 62], [120, 0, 62]], "face face--glass");
    face(g, [[100, 0, 0], [100, 80, 0], [100, 80, 80], [100, 0, 80]], "face face--wall");
    box(g, 16, 96, 0, 56, 40, 14);            // lit
    box(g, 16, 96, 14, 56, 10, 10);           // tête de lit
    box(g, 126, 14, 0, 64, 22, 16);           // canapé
    box(g, 138, 64, 0, 36, 36, 20);           // table
    for (let i = 0; i < 7; i++) box(g, 176, 110 - 0, i * 11, 36, 34 - i * 4.5, 11); // escalier
    line(g, [[W, 0, 0], [W, 0, 12], [W, D, 12], [0, D, 12], [0, D, 0]], "edge edge--cut");

    // 3 · Façades (étage) : murs extérieurs avec fenêtres et balcon
    g = layer("exterieur", "Façades", 115);
    const Z0 = 80, Z1 = 150;
    face(g, [[0, 0, Z1], [W, 0, Z1], [W, D, Z1], [0, D, Z1]], "face face--floor");
    face(g, [[W, 0, Z0], [W, D, Z0], [W, D, Z1], [W, 0, Z1]]);
    face(g, [[0, D, Z0], [W, D, Z0], [W, D, Z1], [0, D, Z1]]);
    [[24, 60], [96, 132]].forEach(([a, b]) => face(g, [[W, a, Z0 + 18], [W, b, Z0 + 18], [W, b, Z0 + 56], [W, a, Z0 + 56]], "face face--glass"));
    [[24, 64], [100, 140], [170, 206]].forEach(([a, b]) => face(g, [[a, D, Z0 + 18], [b, D, Z0 + 18], [b, D, Z0 + 56], [a, D, Z0 + 56]], "face face--glass"));
    line(g, [[90, D + 16, Z0], [150, D + 16, Z0], [150, D + 16, Z0 + 16], [90, D + 16, Z0 + 16], [90, D + 16, Z0]], "edge edge--accent");
    line(g, [[90, D, Z0], [90, D + 16, Z0], [150, D + 16, Z0], [150, D, Z0]], "edge edge--accent");

    // 4 · Toit : deux pans + pignon + cheminée
    g = layer("toit", "Toit", 200);
    const R = 150, H = 66;
    face(g, [[-8, D / 2, R + H], [W + 8, D / 2, R + H], [W + 8, D + 10, R - 6], [-8, D + 10, R - 6]], "face face--roof");
    face(g, [[W, -2, R], [W, D + 2, R], [W, D / 2, R + H]], "face");
    box(g, 150, 30, R + 20, 18, 18, 64, "face face--brick");
    for (let i = 1; i < 6; i++) {
      const t = i / 6;
      line(g, [[-8, D / 2 + (D / 2 + 10) * t, R + H - (H + 6) * t], [W + 8, D / 2 + (D / 2 + 10) * t, R + H - (H + 6) * t]], "edge edge--thin");
    }

    // Légendes reliées à chaque couche
    const labels = el("g", { class: "axo__labels" }, svg);
    $$(".bz", svg).forEach((z) => {
      const [x, y] = P(W, 0, +z.dataset.lz);
      const t = el("g", { class: "axo__label", "data-z": z.dataset.z }, labels);
      el("polyline", { points: `${x + 6},${y} ${x + 40},${y} 424,${y}`, class: "axo__lead" }, t);
      el("circle", { cx: x + 4, cy: y, r: 3, class: "axo__dot" }, t);
      const tx = el("text", { x: 430, y: y + 4 }, t);
      tx.textContent = z.getAttribute("aria-label").toUpperCase();
    });
  })();

  const build = $("#build"), bp = $("#bp");
  let buildZone = null;
  const chooseZone = (z) => {
    if (z === buildZone) return;
    buildZone = z;
    const d = BUILD[z];
    $$(".bz", build).forEach((g) => g.classList.toggle("is-on", g.dataset.z === z));
    $$(".build__chip", build).forEach((c) => c.classList.toggle("is-on", c.dataset.z === z));
    $$(".axo__label", build).forEach((l) => l.classList.toggle("is-on", l.dataset.z === z));
    // vue éclatée : la couche choisie et celles au-dessus se soulèvent
    const order = ["fondations", "interieur", "exterieur", "toit"], sel = order.indexOf(z);
    order.forEach((name, j) => {
      const y = `${-16 * j - (j >= sel ? 30 : 0)}px`;
      $$(`.bz[data-z="${name}"] .bz__body, .axo__label[data-z="${name}"]`, build).forEach((e) => e.style.setProperty("--y", y));
    });
    $("#bpStamp").textContent = `Plan n° ${d.n} · ${d.label}`;
    $("#bpSvg").innerHTML = PLANS[z]
      .map((e, i) => (e[0] === "t" ? `<text x="${e[2]}" y="${e[3]}">${e[1]}</text>` : `<path class="${e[0]}" d="${e[1]}" pathLength="1" style="--i:${i}" />`))
      .join("");
    $("#bpN").textContent = `${d.n} · ${d.label}`;
    $("#bpTitle").textContent = d.title;
    $("#bpDesc").textContent = d.text;
    $("#bpTags").innerHTML = d.tags.map((t) => `<li>${esc(t)}</li>`).join("");
    // relance l'animation : balayage orange puis tracé du plan
    bp.classList.remove("is-scan", "is-anim");
    void bp.offsetWidth;
    bp.classList.add("is-scan", "is-anim");
  };
  $$(".bz, .build__chip", build).forEach((el) => {
    el.addEventListener("click", () => chooseZone(el.dataset.z));
    if (el.classList.contains("bz"))
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); chooseZone(el.dataset.z); }
      });
  });
  chooseZone("interieur");
  // la maison se dessine quand la section apparaît
  new IntersectionObserver((en, obs) => {
    if (!en[0].isIntersecting) return;
    build.classList.add("is-drawn");
    bp.classList.remove("is-scan", "is-anim");
    void bp.offsetWidth;
    bp.classList.add("is-scan", "is-anim");
    obs.disconnect();
  }, { threshold: 0.3 }).observe(build);
  }

  /* ───── Engagements : le contrat se coche puis le tampon frappe ───── */
  const contract = $("#contract");
  if (contract) {
    const cks = $$(".contract__ck", contract);
    new IntersectionObserver((en, obs) => {
      if (!en[0].isIntersecting) return;
      obs.disconnect();
      contract.classList.add("is-signed");
      if (reduce) return;
      // coche les cases une à une (le style de départ les masque tant que .is-signed n'est pas posé)
      cks.forEach((c) => (c.style.transitionDelay = "0s"));
      cks.forEach((c, i) => {
        c.style.setProperty("--d", i);
        c.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 200, delay: 200 + i * 170, fill: "backwards" });
        const tick = c;
        tick.classList.add("is-wait");
        setTimeout(() => tick.classList.remove("is-wait"), 200 + i * 170);
      });
      const stampAt = 200 + cks.length * 170 + 250;
      contract.style.setProperty("--stamp-delay", stampAt + "ms");
      setTimeout(() => { contract.classList.add("is-thump"); }, stampAt + 360);
    }, { threshold: 0.45 }).observe(contract);
  }

  /* ───── Formulaires FormSubmit : envoi sans quitter la page, secours par téléphone / e-mail ───── */
  const validate = (form, note) => {
    let ok = true;
    $$("[required]", form).forEach((input) => {
      if (input.closest("[hidden]") || input.closest(".quiz__set:not(.quiz__final)")) return;
      const valid = input.type === "checkbox" ? input.checked : input.value.trim() && input.checkValidity();
      const box = input.closest(".field, .consent");
      if (box) box.classList.toggle("is-invalid", !valid);
      if (!valid) ok = false;
    });
    if (!ok) note.textContent = "Merci de renseigner votre nom, un e-mail valide et d'accepter la politique de confidentialité.";
    return ok;
  };
  const mailtoFallback = (form) => {
    const d = new FormData(form);
    const lines = [...d.entries()].filter(([k]) => !k.startsWith("_") && k !== "consentement").map(([k, v]) => `${k} : ${v}`);
    return `mailto:sec@embi.fr?subject=${encodeURIComponent("Demande de devis")}&body=${encodeURIComponent(lines.join("\n"))}`;
  };
  const netlifySubmit = (form, note) =>
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validate(form, note)) return;
      const btn = $('button[type="submit"]', form);
      btn.disabled = true;
      note.textContent = "Envoi en cours…";
      try {
        // point d'accès AJAX de FormSubmit (même adresse que le formulaire, préfixée par /ajax)
        const url = form.getAttribute("action").replace("formsubmit.co/", "formsubmit.co/ajax/");
        const r = await fetch(url, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) });
        const res = await r.json().catch(() => ({}));
        if (!r.ok || String(res.success) !== "true") throw new Error(res.message || r.status);
        location.href = "/merci/";
      } catch (err) {
        btn.disabled = false;
        note.innerHTML = `L'envoi n'a pas abouti. Appelez-nous au <a href="tel:+33145726524">01 45 72 65 24</a> ou <a href="${mailtoFallback(form)}">envoyez votre demande par e-mail</a>.`;
      }
    });

  /* ───── Votre projet en 3 questions (formulaire « questionnaire ») ───── */
  const quiz = $("#quiz");
  if (quiz) {
    quiz.noValidate = true;
    const sets = $$(".quiz__set", quiz), quizStep = $("#quizStep"), quizBar = $("#quizBar"), quizBack = $("#quizBack"), restart = $("#quizRestart");
    const QN = sets.length - 1;
    let step = 0;
    const show = (n) => {
      step = n;
      sets.forEach((f, k) => f.classList.toggle("is-current", k === n));
      quizBack.hidden = n === 0;
      restart.hidden = n < QN;
      quizBar.style.transform = `scaleX(${Math.min(n, QN) / QN})`;
      quizStep.textContent = n < QN ? `Question ${n + 1} / ${QN}` : "C'est presque prêt !";
      if (n === QN) {
        const picked = sets.slice(0, QN).map((f) => $("input:checked", f)).filter(Boolean);
        $("#quizRecap").innerHTML = picked.map((i) => `<li>${esc(i.value)}</li>`).join("");
        const lieu = $('input[name="lieu"]:checked', quiz);
        const cat = lieu && lieu.dataset.cat;
        const refs = cat ? projects.filter((p) => p.category === cat).slice(0, 3) : [];
        const box = $("#quizRefs");
        box.hidden = !refs.length;
        box.innerHTML = refs.length ? `Nous avons déjà réalisé des projets comme le vôtre : ${refs.map((r) => `<a href="${window.EMBI_PROJECT_URL(r.id)}"><strong>${esc(r.title)}</strong></a>`).join(", ")}.` : "";
      }
      quiz.classList.add("is-stepping");
    };
    // une réponse choisie → question suivante sans réponse (robuste aux doubles appuis et aux changements d'avis rapides)
    let qTimer = null;
    quiz.addEventListener("change", (e) => {
      const opt = e.target.closest(".quiz__opt input");
      if (!opt) return;
      const set = opt.closest(".quiz__set");
      $$(".quiz__opt", set).forEach((l) => l.classList.toggle("is-picked", l.contains(opt)));
      clearTimeout(qTimer);
      qTimer = setTimeout(() => {
        const next = sets.findIndex((f, j) => j < QN && !$("input:checked", f));
        show(next === -1 ? QN : next);
      }, reduce ? 0 : 220);
    });
    quizBack.addEventListener("click", () => { clearTimeout(qTimer); show(Math.max(step - 1, 0)); });
    restart.addEventListener("click", () => { clearTimeout(qTimer); $$("input[type=radio]", quiz).forEach((i) => (i.checked = false)); $$(".is-picked", quiz).forEach((l) => l.classList.remove("is-picked")); show(0); });
    show(0);
    netlifySubmit(quiz, $("#quizNote"));
  }

  /* ───── Arrivée depuis une autre page (secteur, Sur mesure, Showroom, chantier) : choix pré-coché ───── */
  const preType = {
    conception: "#typeConception", showroom: "#typeShowroom",
    hotel: 'input[value="Un hôtel"]', boutique: 'input[value="Une boutique"]',
    restaurant: 'input[value="Un restaurant"]', particulier: 'input[value="Un logement (particulier)"]',
  }[new URLSearchParams(location.search).get("type")];
  if (preType) {
    const c = document.querySelector(`#form ${preType}`);
    if (c) c.checked = true;
  }

  /* ───── Formulaire de devis ───── */
  const form = $("#form");
  if (form) {
    form.noValidate = true;
    netlifySubmit(form, $("#formNote"));
  }
})();

/* ───── Fonctionnement : la pièce se transforme à chaque étape ───── */
(() => {
  if (!document.getElementById("mt-scene")) return;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NAMES = ["Étude", "Chiffrage", "Mise en place", "Réalisation", "Livraison"];
  const DURATION = 6000;
  // croquis d'architecte de la livraison : utilisé seulement si l'image est présente
  let sketchOk = false;
  const skImg = document.querySelector("#mt-sketch img");
  if (skImg) {
    const ok = () => { sketchOk = true; skImg.parentElement.hidden = false; if (k === 4) show(4); };
    skImg.complete && skImg.naturalWidth ? setTimeout(ok, 0) : skImg.addEventListener("load", ok);
    skImg.loading = "eager";
  }
  const scene = $("#mt-scene"), steps = $$("#methode .mt-step"), bars = $$("#methode .mt-step__bar i");
  let k = -1, t0 = performance.now(), elapsed = 0, paused = false, inView = true, hovering = false;

  const show = (n) => {
    k = n;
    elapsed = 0;
    t0 = performance.now();
    steps.forEach((s, i) => s.classList.toggle("is-on", i === n));
    bars.forEach((b) => (b.style.transform = "scaleX(0)"));
    $("#mt-chip").textContent = `${String(n + 1).padStart(2, "0")} · ${NAMES[n]}`;
    scene.classList.toggle("is-dark", n <= 1);
    $$(".ly", scene).forEach((g) => {
      const on = g.dataset.s.split(",").map(Number).includes(n);
      if (on && !g.classList.contains("is-on")) {
        g.classList.remove("is-on");
        void g.getBoundingClientRect();
      }
      g.classList.toggle("is-on", on);
    });
    $("#mt-devis").classList.toggle("is-on", n === 1);
    const sk = $("#mt-sketch");
    if (sk && sketchOk) {
      sk.classList.remove("is-on");
      void sk.offsetWidth;
      sk.classList.toggle("is-on", n === 4);
    }
  };

  const tick = (t) => {
    const running = !paused && !hovering && inView && !reduce;
    if (running) {
      elapsed += t - t0;
      if (elapsed >= DURATION) show((k + 1) % 5);
    }
    t0 = t;
    if (bars[k]) bars[k].style.transform = `scaleX(${Math.min(elapsed / DURATION, 1)})`;
    if (inView && !document.hidden) requestAnimationFrame(tick);
    else looping = false;
  };
  let looping = false;
  const start = () => { if (!looping) { looping = true; t0 = performance.now(); requestAnimationFrame(tick); } };

  $$("#methode .mt-step button").forEach((b) => b.addEventListener("click", () => show(+b.dataset.k)));
  $("#mt-pause").addEventListener("click", (e) => {
    paused = !paused;
    e.currentTarget.textContent = paused ? "Lecture" : "Pause";
  });
  scene.addEventListener("mouseenter", () => (hovering = true));
  scene.addEventListener("mouseleave", () => (hovering = false));
  new IntersectionObserver((en) => { inView = en[0].isIntersecting; if (inView) start(); }, { threshold: 0.3 }).observe(scene);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && inView) start(); });
  if (reduce) $("#mt-ctrlTxt").textContent = "Cliquez sur une étape pour la voir";
  show(0);
  start();
})();
