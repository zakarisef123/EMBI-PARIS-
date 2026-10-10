/* Page d'un chantier : /realisations/<id>/ (contenu écrit par scripts/build.js).
   Ici : en-tête, menu mobile, galerie (photos manquantes retirées) et visionneuse. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  $("#year").textContent = new Date().getFullYear();
  document.body.classList.add("is-loaded");

  /* ───── En-tête : fond transparent sur la photo, puis clair au défilement ───── */
  const header = $("#header"), hero = $("#pjHero"), progress = $("#progress");
  let lastY = 0, heroH = 0, docH = 0, ticking = false;
  const measure = () => { heroH = hero.offsetHeight; docH = document.documentElement.scrollHeight - innerHeight; };
  const onScroll = () => {
    ticking = false;
    if (document.body.classList.contains("menu-open")) return; // en-tête figé pendant que le menu est ouvert
    const y = scrollY;
    header.classList.toggle("is-scrolled", y > 20);
    header.classList.toggle("on-dark", y < heroH - 60);
    header.classList.toggle("is-hidden", y > 400 && y > lastY && !$("#nav").classList.contains("is-open"));
    lastY = y;
    progress.style.transform = `scaleX(${docH > 0 ? Math.min(y / docH, 1) : 0})`;
  };
  // un seul calcul par image affichée ; hauteurs mesurées au chargement et au redimensionnement
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", () => { measure(); onScroll(); }, { passive: true });
  addEventListener("load", measure);
  new ResizeObserver(measure).observe(document.body);
  measure();
  const burger = $("#burger"), nav = $("#nav");
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    window.EMBI_MENU_LOCK(open);
  };
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); burger.focus(); } });
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  onScroll();

  /* ───── Apparition au scroll (titre de la FAQ en bas de page) ───── */
  const io = new IntersectionObserver((en) => en.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { threshold: 0.12 });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ───── Galerie ───── */
  const gallery = $("#pjGallery");
  if (!gallery) return;
  const title = $("#pjTitle").textContent;
  const shots = () => $$(".pj-shot", gallery);
  const srcs = () => shots().map((b) => b.dataset.full || $("img", b).currentSrc || $("img", b).getAttribute("src"));
  // photos de l'ancien site qui n'existent pas : retirées de la galerie
  const recount = () => {
    const n = shots().length;
    $("#pjCount").textContent = n > 1 ? `${n} photos · cliquez pour agrandir` : "Cliquez sur la photo pour l'agrandir";
    gallery.classList.toggle("is-single", n === 1);
    shots().forEach((b, j) => { b.dataset.k = j; b.setAttribute("aria-label", `Agrandir la photo ${j + 1}`); });
  };
  $$(".pj-shot img", gallery).forEach((im, k) => {
    const drop = () => {
      const btn = im.closest(".pj-shot");
      if (!btn || !btn.isConnected) return;
      if (shots().length > 1) { btn.remove(); recount(); }
      else $("#galerie").hidden = true; // aucune photo disponible : la galerie est masquée
    };
    im.complete && im.naturalWidth === 0 ? drop() : im.addEventListener("error", drop);
  });

  /* ───── Photos qui défilent à côté du texte ───── */
  const show = $("#pjShow");
  if (show) {
    const slides = () => $$(".pj-show__slide", show);
    const dots = () => $$(".pj-show__dots i", show);
    let cur = 0, timer = null, inView = false, hold = false;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const go = (k) => {
      const sl = slides(), d = dots();
      if (!sl.length) return;
      cur = (k + sl.length) % sl.length;
      sl.forEach((s, j) => { s.classList.toggle("is-on", j === cur); s.tabIndex = j === cur ? 0 : -1; });
      d.forEach((x, j) => x.classList.toggle("is-on", j === cur));
      $(".pj-show__count b", show).textContent = cur + 1;
      // la photo suivante se charge à l'avance
      const nx = sl[(cur + 1) % sl.length];
      const im = nx && $("img", nx);
      if (im && im.loading === "lazy") im.loading = "eager";
    };
    const tick = () => { clearTimeout(timer); if (!reduce && inView && !hold && !document.hidden && slides().length > 1) timer = setTimeout(() => { go(cur + 1); tick(); }, 4500); };
    $(".pj-show__prev", show).addEventListener("click", () => { go(cur - 1); tick(); });
    $(".pj-show__next", show).addEventListener("click", () => { go(cur + 1); tick(); });
    show.addEventListener("mouseenter", () => { hold = true; tick(); });
    show.addEventListener("mouseleave", () => { hold = false; tick(); });
    show.addEventListener("focusin", () => { hold = true; tick(); });
    show.addEventListener("focusout", () => { hold = false; tick(); });
    document.addEventListener("visibilitychange", tick);
    new IntersectionObserver((en) => { inView = en[0].isIntersecting; tick(); }, { threshold: 0.3 }).observe(show);
    // glisser du doigt pour changer de photo
    let sx = null;
    show.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
    show.addEventListener("touchend", (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      sx = null;
      if (Math.abs(dx) > 40) { go(cur + (dx < 0 ? 1 : -1)); tick(); }
    });
    // photo absente de l'ancien site : retirée du diaporama (et le diaporama masqué s'il n'en reste aucune)
    const recountShow = () => {
      const n = slides().length;
      if (!n) { show.remove(); document.querySelector(".pj-body__grid").classList.add("is-noshow"); return; }
      $(".pj-show__count span", show).textContent = n;
      $(".pj-show__bar", show).hidden = n < 2;
      if (cur >= n) cur = 0;
      go(cur);
    };
    slides().forEach((btn) => {
      const im = $("img", btn);
      const drop = () => {
        if (!btn.isConnected) return;
        const k = slides().indexOf(btn);
        btn.remove();
        const d = dots()[k];
        if (d) d.remove();
        recountShow();
      };
      im.complete && im.naturalWidth === 0 ? drop() : im.addEventListener("error", drop);
    });
  }

  /* ───── Visionneuse ───── */
  const lb = $("#lb"), lbImg = $("#lbImg");
  let cur = 0, lastFocus = null;
  const showLb = (k) => {
    const list = srcs();
    cur = (k + list.length) % list.length;
    lbImg.src = list[cur];
    lbImg.alt = `${title}, photo ${cur + 1}`;
    $("#lbCount").textContent = `${cur + 1} / ${list.length}`;
    $("#lbPrev").hidden = $("#lbNext").hidden = list.length < 2;
  };
  const openLb = (k, from) => { lastFocus = from; showLb(k); lb.hidden = false; document.body.style.overflow = "hidden"; $("#lbClose").focus(); };
  const closeLb = () => { lb.hidden = true; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); };
  gallery.addEventListener("click", (e) => { const b = e.target.closest(".pj-shot"); if (b) openLb(+b.dataset.k, b); });
  if (show) show.addEventListener("click", (e) => {
    const b = e.target.closest(".pj-show__slide");
    if (!b) return;
    const k = srcs().indexOf(b.dataset.full);
    openLb(k < 0 ? 0 : k, b);
  });
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
})();
