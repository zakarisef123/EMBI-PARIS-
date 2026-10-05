/* « Du plan au volume » : les murs sortent du plan (même animation que la page Conception sur mesure) */
(() => {
  if (!document.getElementById("volSvg")) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };

  /* 2 · plan → volume : murs définis en plan, extrudés en axonométrie */
  const walls = [[60,50,540,50],[540,50,540,350],[540,350,60,350],[60,350,60,50],[300,50,300,170],[300,230,300,350],[60,200,180,200],[230,200,300,200],[420,350,420,260],[420,260,540,260]];
  const svg2 = document.getElementById("volSvg");
  const H = 80, C = Math.cos(Math.PI / 6), S = Math.sin(Math.PI / 6);
  const proj = (x, y, z, t) => {
    const ix = 300 + ((x - 300) - (y - 200)) * C * 0.72, iy = 250 + ((x - 300) + (y - 200)) * S * 0.72 - z * 0.9;
    return [x + (ix - x) * t, y + (iy - y) * t];
  };
  const floor = el("polygon", { class: "floor" }, svg2);
  // Chaque mur est découpé en petits tronçons dessinés du fond vers l'avant
  // (algorithme du peintre) : un mur de devant recouvre toujours ceux de derrière.
  // Les deux murs de façade avant sont coupés bas, comme sur une maquette, pour voir l'intérieur.
  const STEP = 20;
  const isFront = ([x1, y1, x2, y2]) => (y1 === 350 && y2 === 350) || (x1 === 540 && x2 === 540);
  const segs = [];
  walls.forEach((w) => {
    const [x1, y1, x2, y2] = w, len = Math.hypot(x2 - x1, y2 - y1), n = Math.max(1, Math.round(len / STEP));
    for (let i = 0; i < n; i++) {
      const a = [x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n];
      const b = [x1 + ((x2 - x1) * (i + 1)) / n, y1 + ((y2 - y1) * (i + 1)) / n];
      segs.push({ a, b, side: x1 === x2, h: isFront(w) ? 0.3 : 1, first: i === 0, last: i === n - 1, depth: (a[0] + a[1] + b[0] + b[1]) / 2 });
    }
  });
  // Mobilier : des boîtes posées au sol, qui montent en même temps que les murs
  // [x, y, largeur, profondeur, hauteur, matière]
  const FURN = [
    [70, 62, 90, 66, 16, "lit"], [70, 62, 90, 10, 34, "bois"], [244, 58, 52, 22, 60, "bois"],
    [420, 58, 110, 34, 20, "tissu"], [440, 118, 60, 30, 10, "bois"],
    [70, 268, 58, 74, 18, "blanc"], [196, 324, 56, 22, 26, "blanc"],
    [446, 286, 78, 34, 30, "bois"],
  ];
  const furn = FURN.map(([x, y, w, d, h, m]) => ({ furn: true, x, y, w, d, h, m, depth: x + w / 2 + y + d / 2 + 0.1 }));
  const items = [...segs, ...furn].sort((p, q) => p.depth - q.depth);
  const wallG = el("g", {}, svg2);
  items.forEach((it) => {
    if (it.furn) {
      it.faces = ["fside", "fside f-y", "ftop"].map((c) => el("polygon", { class: `furn ${c} m-${it.m}` }, wallG));
      return;
    }
    it.face = el("polygon", { class: "wall" + (it.side ? " side" : "") }, wallG);
    it.edge = el("path", { class: "wall-edge" }, wallG);
  });
  const planG = el("g", { class: "t-plan" }, svg2);
  el("path", { class: "door", d: "M300 170 A60 60 0 0 1 360 230 M180 200 A50 50 0 0 0 230 150" }, planG);
  el("path", { class: "dim", d: "M60 372 H540 M60 366 v12 M540 366 v12" }, planG);
  [["Chambre",120,130],["Séjour",390,130],["SdB",120,290],["Cuisine",450,310]].forEach(([s,x,y]) => { const tx = el("text", { x, y }, planG); tx.textContent = s; });
  const draw2 = (t) => {
    const e = t * t * (3 - 2 * t);
    floor.setAttribute("points", [[60,50],[540,50],[540,350],[60,350]].map(([x,y]) => proj(x,y,0,e).join(",")).join(" "));
    floor.style.opacity = e;
    segs.forEach((sg) => {
      const z = H * e * sg.h;
      const A0 = proj(sg.a[0], sg.a[1], 0, e), B0 = proj(sg.b[0], sg.b[1], 0, e);
      const A1 = proj(sg.a[0], sg.a[1], z, e), B1 = proj(sg.b[0], sg.b[1], z, e);
      sg.face.setAttribute("points", [A0, B0, B1, A1].map((p) => p.join(",")).join(" "));
      let d = `M${A0} L${B0} M${A1} L${B1}`;
      if (sg.first) d += ` M${A0} L${A1}`;
      if (sg.last) d += ` M${B0} L${B1}`;
      sg.edge.setAttribute("d", d);
    });
    furn.forEach(({ x, y, w, d, h, faces }) => {
      const z = h * e, P = (px, py, pz) => proj(px, py, pz, e).join(",");
      faces[0].setAttribute("points", [P(x + w, y, 0), P(x + w, y + d, 0), P(x + w, y + d, z), P(x + w, y, z)].join(" "));
      faces[1].setAttribute("points", [P(x, y + d, 0), P(x + w, y + d, 0), P(x + w, y + d, z), P(x, y + d, z)].join(" "));
      faces[2].setAttribute("points", [P(x, y, z), P(x + w, y, z), P(x + w, y + d, z), P(x, y + d, z)].join(" "));
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

  // lancement à l'arrivée à l'écran
  const box = document.querySelector('[data-anim="volume"]');
  const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { box.querySelector(".stage").classList.add("go"); runVolume(); io.disconnect(); } }, { threshold: 0.4 });
  io.observe(box);
  draw2(0);
})();
