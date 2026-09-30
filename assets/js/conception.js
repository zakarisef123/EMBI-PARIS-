/* Page « Conception sur mesure » : en-tête, menu mobile, progression, apparitions */
(() => {
  const $ = (s) => document.querySelector(s);
  $("#year").textContent = new Date().getFullYear();
  document.body.classList.add("is-loaded");
  const header = $("#header"), hero = $("#csHero"), progress = $("#progress"), nav = $("#nav"), burger = $("#burger");
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle("is-scrolled", y > 20);
    header.classList.toggle("on-dark", y < hero.offsetHeight - 60);
    header.classList.toggle("is-hidden", y > 400 && y > lastY && !nav.classList.contains("is-open"));
    lastY = y;
    const h = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
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
  const pencil = document.querySelector("#s1 .pencil");
  let pencilRaf = null;
  const runPencil = () => {
    cancelAnimationFrame(pencilRaf);
    pencil.classList.remove("done");
    const stage = document.getElementById("s1"), paths = [...skG.children], t0 = performance.now(), per = 110, dur = 900;
    const tick = (t) => {
      const el = Math.max(t - t0, 0), k = Math.min(Math.floor(el / per), paths.length - 1);
      const local = Math.min(Math.max((el - k * per) / dur, 0), 1);
      const p = paths[k], L = p.getTotalLength(), pt = p.getPointAtLength(L * (1 - Math.pow(1 - local, 3)));
      const sx = stage.clientWidth / 600, sy = stage.clientHeight / 400;
      pencil.style.left = pt.x * sx + "px"; pencil.style.top = pt.y * sy + "px";
      if (el < paths.length * per + dur) pencilRaf = requestAnimationFrame(tick); else pencil.classList.add("done");
    };
    if (!reduce) pencilRaf = requestAnimationFrame(tick); else pencil.classList.add("done");
  };

  /* 2 · plan → volume : murs définis en plan, extrudés en axonométrie */
  const walls = [[60,50,540,50],[540,50,540,350],[540,350,60,350],[60,350,60,50],[300,50,300,170],[300,230,300,350],[60,200,180,200],[230,200,300,200],[420,350,420,260],[420,260,540,260]];
  const svg2 = document.getElementById("volSvg");
  const H = 80, C = Math.cos(Math.PI / 6), S = Math.sin(Math.PI / 6);
  const proj = (x, y, z, t) => {
    const ix = 300 + ((x - 300) - (y - 200)) * C * 0.72, iy = 250 + ((x - 300) + (y - 200)) * S * 0.72 - z * 0.9;
    return [x + (ix - x) * t, y + (iy - y) * t];
  };
  const floor = el("polygon", { class: "floor" }, svg2);
  const wallEls = walls.map(() => el("polygon", { class: "wall" }, svg2));
  const planG = el("g", { class: "t-plan" }, svg2);
  el("path", { class: "door", d: "M300 170 A60 60 0 0 1 360 230 M180 200 A50 50 0 0 0 230 150" }, planG);
  el("path", { class: "dim", d: "M60 372 H540 M60 366 v12 M540 366 v12" }, planG);
  [["Chambre",120,130],["Séjour",390,130],["SdB",120,290],["Cuisine",450,310]].forEach(([s,x,y]) => { const tx = el("text", { x, y }, planG); tx.textContent = s; });
  const draw2 = (t) => {
    const e = t * t * (3 - 2 * t);
    floor.setAttribute("points", [[60,50],[540,50],[540,350],[60,350]].map(([x,y]) => proj(x,y,0,e).join(",")).join(" "));
    floor.style.opacity = e;
    walls.forEach(([x1,y1,x2,y2], k) => {
      const z = H * e;
      const pts = [proj(x1,y1,0,e), proj(x2,y2,0,e), proj(x2,y2,z,e), proj(x1,y1,z,e)];
      wallEls[k].setAttribute("points", pts.map((p) => p.join(",")).join(" "));
      wallEls[k].classList.toggle("side", x1 === x2);
    });
    planG.style.opacity = 1 - e * 1.6;
  };
  let volRaf = null;
  const runVolume = () => {
    cancelAnimationFrame(volRaf);
    const label = document.getElementById("volLabel");
    label.textContent = "Plan · vue de dessus";
    draw2(0);
    if (reduce) { draw2(1); label.textContent = "Volume · axonométrie"; return; }
    const t0 = performance.now() + 1200, dur = 2200;
    const tick = (t) => {
      const k = Math.min(Math.max((t - t0) / dur, 0), 1);
      draw2(k);
      if (k > 0.5) label.textContent = "Volume · axonométrie";
      if (k < 1) volRaf = requestAnimationFrame(tick);
    };
    volRaf = requestAnimationFrame(tick);
  };

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

  /* lancement à l'arrivée à l'écran + Rejouer */
  const RUN = { sketch: runPencil, volume: runVolume, calque: runCalque, board: () => {} };
  const play = (box) => {
    const stage = box.querySelector(".stage");
    stage.classList.remove("go");
    void stage.offsetWidth;
    stage.classList.add("go");
    RUN[box.dataset.anim]();
  };
  const io = new IntersectionObserver((en) => en.forEach((e) => { if (e.isIntersecting) { play(e.target); io.unobserve(e.target); } }), { threshold: 0.4 });
  document.querySelectorAll("[data-anim]").forEach((box) => {
    io.observe(box);
    const b = box.querySelector(".cs-replay");
    if (b) b.addEventListener("click", () => play(box));
  });
  draw2(0);
})();
