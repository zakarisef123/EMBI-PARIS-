/* Page d'un chantier : projet.html?p=<id> — contenu tiré de projects.js */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const projects = window.EMBI_PROJECTS || [];
  const cats = window.EMBI_CATEGORIES || {};
  const url = window.EMBI_PROJECT_URL;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lead = { hotel: "Hôtel rénové", boutique: "Boutique rénovée", restaurant: "Restaurant rénové", particulier: "Appartement rénové" };

  $("#year").textContent = new Date().getFullYear();
  document.body.classList.add("is-loaded");

  /* ───── En-tête : fond transparent sur la photo, puis clair au défilement ───── */
  const header = $("#header"), hero = $("#pjHero"), progress = $("#progress");
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle("is-scrolled", y > 20);
    header.classList.toggle("on-dark", y < hero.offsetHeight - 60);
    header.classList.toggle("is-hidden", y > 400 && y > lastY && !$("#nav").classList.contains("is-open"));
    lastY = y;
    const h = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true });
  const burger = $("#burger"), nav = $("#nav");
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });

  /* ───── Chantier demandé ───── */
  const id = new URLSearchParams(location.search).get("p");
  const i = projects.findIndex((p) => p.id === id);
  const p = projects[i];

  if (!p) {
    document.title = "Réalisation introuvable | EMBI";
    $("#pjTitle").textContent = "Chantier introuvable";
    $("#pjCat").textContent = "Réalisations";
    $("#pjLead").textContent = "Ce chantier n'existe pas ou a changé d'adresse. Retrouvez toutes nos réalisations ci-dessous.";
    $("#pjCrumb").textContent = "Introuvable";
    $("#pjCover").src = projects[0] ? projects[0].images[0] : "";
    $(".pj-body").hidden = true;
    $("#galerie").hidden = true;
    $("#pjMoreTitle").innerHTML = "Toutes nos <em>réalisations.</em>";
    $("#pjMore").innerHTML = projects.map(card).join("");
    onScroll();
    return;
  }

  const cat = cats[p.category] || "";
  document.title = `${p.title} · ${cat} | EMBI, rénovation à Paris`;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.content = p.text || `${p.title} : ${(lead[p.category] || "Lieu rénové").toLowerCase()} clé en main par EMBI à Paris. Photos et détails du chantier.`;

  // En-tête
  $("#pjCover").src = p.images[0];
  $("#pjCover").alt = `${p.title}, ${cat.toLowerCase()} rénové par EMBI`;
  $("#pjTitle").textContent = p.title;
  $("#pjCrumb").textContent = p.title;
  $("#pjCat").innerHTML = `<span>${esc(cat)}</span>${p.lieu ? ` · ${esc(p.lieu)}` : ""}${p.annee ? ` · ${esc(p.annee)}` : ""}`;
  $("#pjLead").textContent = p.text || `${lead[p.category] || "Lieu rénové"} clé en main par EMBI, de l'étude de faisabilité à la livraison.`;

  // Le projet en bref (seulement ce qui est renseigné)
  const facts = [
    ["Catégorie", cat],
    ["Lieu", p.lieu],
    ["Année", p.annee],
    ["Surface", p.surface],
    ["Durée", p.duree],
    ["Décoration", p.deco],
    ["Architecte", p.archi],
    ["Prestation", "Clé en main"],
  ].filter(([, v]) => v);
  $("#pjFacts").innerHTML = `<p class="pj-facts__title">Le projet en bref</p><dl>${facts
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`)
    .join("")}</dl>`;

  // Récit
  const story = p.histoire && p.histoire.length
    ? p.histoire
    : [
        `Comme pour chaque chantier EMBI, ce projet a été mené de A à Z : étude de faisabilité, chiffrage transparent poste par poste, puis coordination de tous les corps de métier jusqu'à la livraison.`,
        `Un interlocuteur unique a suivi le chantier du premier rendez-vous à la remise des clés, avec le souci du détail et le respect des délais qui font la réputation d'EMBI.`,
      ];
  $("#pjStory").innerHTML = story.map((t) => `<p>${esc(t)}</p>`).join("");
  $("#pjWorks").innerHTML = (p.travaux || []).map((t) => `<li>${esc(t)}</li>`).join("");
  $("#pjWorks").hidden = !(p.travaux && p.travaux.length);

  // Galerie
  const imgs = [...p.images];
  $("#pjCount").textContent = imgs.length > 1 ? `${imgs.length} photos · cliquez pour agrandir` : "Cliquez sur la photo pour l'agrandir";
  $("#pjGallery").classList.toggle("is-single", imgs.length === 1);
  const gallery = $("#pjGallery");
  gallery.innerHTML = imgs
    .map((src, k) => `<button type="button" class="pj-shot" data-k="${k}" aria-label="Agrandir la photo ${k + 1}"><img src="${esc(src)}" alt="${esc(p.title)}, photo ${k + 1}" loading="eager" /></button>`)
    .join("");

  // Visionneuse
  const lb = $("#lb"), lbImg = $("#lbImg");
  let cur = 0, lastFocus = null;
  const showLb = (k) => {
    cur = (k + imgs.length) % imgs.length;
    lbImg.src = imgs[cur];
    lbImg.alt = `${p.title}, photo ${cur + 1}`;
    $("#lbCount").textContent = `${cur + 1} / ${imgs.length}`;
    $("#lbPrev").hidden = $("#lbNext").hidden = imgs.length < 2;
  };
  const openLb = (k, from) => { lastFocus = from; showLb(k); lb.hidden = false; document.body.style.overflow = "hidden"; $("#lbClose").focus(); };
  const closeLb = () => { lb.hidden = true; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); };
  // photos de l'ancien site qui n'existent pas : retirées de la galerie
  const recount = () => {
    const n = $$(".pj-shot", gallery).length;
    $("#pjCount").textContent = n > 1 ? `${n} photos · cliquez pour agrandir` : "Cliquez sur la photo pour l'agrandir";
    gallery.classList.toggle("is-single", n === 1);
  };
  $$(".pj-shot img", gallery).forEach((im) => {
    const drop = () => {
      const src = im.getAttribute("src");
      const k = imgs.indexOf(src);
      if (k > 0) imgs.splice(k, 1);
      im.parentElement.remove();
      $$(".pj-shot", gallery).forEach((b, j) => (b.dataset.k = j));
      recount();
    };
    im.complete && im.naturalWidth === 0 && im.getAttribute("src") ? drop() : im.addEventListener("error", drop);
  });
  $("#pjGallery").addEventListener("click", (e) => { const b = e.target.closest(".pj-shot"); if (b) openLb(+b.dataset.k, b); });
  $("#lbClose").addEventListener("click", closeLb);
  $("#lbPrev").addEventListener("click", () => showLb(cur - 1));
  $("#lbNext").addEventListener("click", () => showLb(cur + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") showLb(cur - 1);
    if (e.key === "ArrowRight") showLb(cur + 1);
  });
  let tx = null;
  lb.addEventListener("touchstart", (e) => (tx = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) showLb(cur + (dx < 0 ? 1 : -1));
    tx = null;
  });

  // Chantier précédent / suivant
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  $("#pjNav").innerHTML = `
    <a class="pj-nav__link pj-nav__link--prev" href="${url(prev.id)}"><span>← Chantier précédent</span><strong>${esc(prev.title)}</strong></a>
    <a class="pj-nav__link pj-nav__link--next" href="${url(next.id)}"><span>Chantier suivant →</span><strong>${esc(next.title)}</strong></a>`;

  // Autres chantiers de la même catégorie (complétés par d'autres si besoin)
  const same = projects.filter((q) => q.category === p.category && q.id !== p.id);
  const others = projects.filter((q) => q.category !== p.category && q.id !== p.id);
  const more = same.concat(others).slice(0, 3);
  $("#pjMore").innerHTML = more.map(card).join("");
  $("#pjMoreTitle").innerHTML = same.length ? `Autres <em>${esc((cats[p.category] || "").toLowerCase())}s.</em>` : `Autres <em>réalisations.</em>`;
  onScroll();

  function card(q) {
    return `<a class="pj-card" href="${url(q.id)}">
      <span class="pj-card__media"><img src="${esc(q.images[0])}" alt="${esc(q.title)}" loading="lazy" /></span>
      <span class="pj-card__info"><strong>${esc(q.title)}</strong><em>${esc(cats[q.category] || "")}</em></span>
    </a>`;
  }
  void reduce;
})();
