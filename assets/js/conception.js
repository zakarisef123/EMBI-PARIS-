/* Page « Conception sur mesure » : en-tête, menu mobile, progression, apparitions */
(() => {
  const $ = (s) => document.querySelector(s);
  $("#year").textContent = new Date().getFullYear();
  document.body.classList.add("is-loaded");
  const header = $("#header"), hero = $("#csHero"), progress = $("#progress"), nav = $("#nav"), burger = $("#burger");
  header.classList.remove("on-dark"); // en-tête clair : l'en-tête de page n'est plus une photo sombre
  let lastY = 0, heroH = 0, docH = 0, ticking = false;
  const measure = () => { heroH = hero.offsetHeight; docH = document.documentElement.scrollHeight - innerHeight; };
  const onScroll = () => {
    ticking = false;
    if (document.body.classList.contains("menu-open")) return; // en-tête figé pendant que le menu est ouvert
    const y = scrollY;
    header.classList.toggle("is-scrolled", y > 20);
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

/* ───── Animations : croquis, plan → volume, calque, planche de matières ───── */
(() => {
  if (!document.querySelector("[data-anim]")) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };

  /* 1 · lignes du croquis (pièce en perspective, calée sur le croquis coloré) */
  const lines = [
    "M150 90 H450 V270 H150 Z", "M0 0 L150 90", "M600 0 L450 90", "M0 400 L150 270", "M600 400 L450 270",
    "M150 100 H450", "M168 120 h120 v130 h-120 Z", "M312 120 h120 v130 h-120 Z",
    "M30 60 L118 102 L118 318 L30 372 Z", "M74 81 V345", "M476 114 L542 72 L542 358 L476 322 Z",
    "M300 18 V70", "M280 86 Q300 64 320 86 Z", "M200 232 H400 V262 H200 Z", "M188 250 H412 V290 H188 Z",
    "M250 320 a50 12 0 1 0 100 0 a50 12 0 1 0 -100 0", "M20 400 L150 300 M120 400 L200 300 M240 400 L260 300 M360 400 L340 300 M480 400 L400 300 M580 400 L450 300",
  ];
  const skG = document.getElementById("skLines");
  lines.forEach((d, i) => el("path", { d, pathLength: 1, class: i > 15 ? "thin" : "", style: `--i:${i}` }, skG));

  /* 2 · plan → volume : animation partagée avec la page Rénovation intérieure (volume.js) */

  /* 3 · calque : balayage automatique, puis au doigt / à la souris */
  const s3 = document.getElementById("s3"), range = document.getElementById("calqueRange");
  let calRaf = null;
  const setX = (v) => { s3.style.setProperty("--x", v + "%"); range.value = v; };
  range.addEventListener("input", () => { cancelAnimationFrame(calRaf); setX(range.value); });
  const runCalque = () => {
    cancelAnimationFrame(calRaf);
    if (reduce) return setX(45);
    const t0 = performance.now(), dur = 2600;
    const tick = (t) => {
      const k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 3);
      setX(100 - e * 58);
      if (k < 1) calRaf = requestAnimationFrame(tick);
    };
    setX(100);
    calRaf = requestAnimationFrame(tick);
  };

  /* lancement à l'arrivée à l'écran */
  const RUN = { sketch: () => {}, volume: () => {}, calque: runCalque, board: () => {} };
  const play = (box) => {
    const stage = box.querySelector(".stage");
    stage.classList.remove("go");
    void stage.offsetWidth;
    stage.classList.add("go");
    RUN[box.dataset.anim]();
  };
  const io = new IntersectionObserver((en) => en.forEach((e) => { if (e.isIntersecting) { play(e.target); io.unobserve(e.target); } }), { threshold: 0.4 });
  document.querySelectorAll("[data-anim]").forEach((box) => io.observe(box));
})();
