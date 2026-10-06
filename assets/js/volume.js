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
  // Cloisons intérieures coupées à la même hauteur que la façade avant : le mobilier reste visible et rien ne dépasse
  const isInner = ([x1, y1, x2, y2]) => !(x1 === x2 && (x1 === 60 || x1 === 540)) && !(y1 === y2 && (y1 === 50 || y1 === 350));
  const isFront = ([x1, y1, x2, y2]) => (y1 === 350 && y2 === 350) || (x1 === 540 && x2 === 540);
  const segs = [];
  walls.forEach((w) => {
    const [x1, y1, x2, y2] = w, len = Math.hypot(x2 - x1, y2 - y1), n = Math.max(1, Math.round(len / STEP));
    for (let i = 0; i < n; i++) {
      const a = [x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n];
      const b = [x1 + ((x2 - x1) * (i + 1)) / n, y1 + ((y2 - y1) * (i + 1)) / n];
      segs.push({ a, b, side: x1 === x2, h: isFront(w) || isInner(w) ? 0.32 : 1, first: i === 0, last: i === n - 1, depth: (a[0] + a[1] + b[0] + b[1]) / 2 });
    }
  });
  // Mobilier : des groupes de boîtes posées au sol, qui montent en même temps que les murs.
  // Chaque boîte : [x, y, largeur, profondeur, hauteur, matière, hauteur de départ]
  // Dans un groupe, les boîtes se dessinent dans l'ordre (le matelas avant les oreillers…).
  const GROUPS = [
    // Chambre : lit double, chevets et lampes, dressing, bureau, tapis
    [[80, 56, 90, 8, 36, "bois"], [80, 62, 90, 72, 10, "bois"], [82, 64, 86, 68, 9, "lit", 10],
     [88, 68, 32, 13, 6, "blanc", 19], [130, 68, 32, 13, 6, "blanc", 19], [82, 104, 86, 26, 2, "tissu", 19]],
    [[64, 60, 14, 14, 16, "bois"], [67, 63, 8, 8, 12, "laiton", 16]],
    [[174, 60, 14, 14, 16, "bois"], [177, 63, 8, 8, 12, "laiton", 16]],
    [[200, 54, 50, 20, 60, "bois"]],
    [[112, 142, 58, 42, 1, "tapis"]],
    [[62, 150, 22, 44, 22, "bois"], [64, 156, 10, 10, 14, "noir", 22], [90, 166, 14, 14, 14, "tissu"], [90, 166, 4, 14, 30, "tissu"]],
    // Séjour : bibliothèque, tapis, canapé, fauteuil, table basse, plante
    [[302, 70, 12, 70, 44, "bois"]],
    [[400, 98, 120, 72, 1, "tapis"], [445, 114, 50, 26, 10, "bois"], [455, 118, 10, 8, 6, "laiton", 10]],
    [[420, 56, 110, 8, 28, "tissu"], [420, 62, 110, 26, 12, "tissu"], [420, 62, 8, 26, 20, "tissu"], [522, 62, 8, 26, 20, "tissu"],
     [430, 63, 28, 8, 12, "tapis", 12], [492, 63, 28, 8, 12, "tapis", 12]],
    [[372, 112, 24, 24, 12, "tissu"], [372, 112, 6, 24, 26, "tissu"]],
    [[512, 226, 14, 14, 12, "bois"], [510, 224, 18, 18, 30, "plante", 12]],
    // Salle à manger : table et quatre chaises
    [[330, 250, 12, 10, 14, "bois"], [368, 250, 12, 10, 14, "bois"], [318, 260, 74, 36, 22, "bois"],
     [330, 298, 12, 10, 14, "bois"], [368, 298, 12, 10, 14, "bois"], [348, 270, 12, 12, 10, "plante", 22]],
    // Salle de bain : baignoire, douche, WC, meuble vasque
    [[64, 266, 42, 78, 18, "blanc"], [70, 272, 30, 66, 2, "eau", 16]],
    [[234, 206, 62, 52, 3, "blanc"], [240, 212, 50, 40, 1, "eau", 3]],
    [[150, 330, 16, 18, 14, "blanc"], [150, 342, 16, 7, 26, "blanc"]],
    [[196, 330, 64, 18, 24, "bois"], [206, 332, 44, 14, 3, "blanc", 24]],
    // Cuisine : réfrigérateur, plan de travail et plaque, îlot et tabourets
    [[424, 262, 24, 20, 62, "inox"]],
    [[450, 262, 86, 18, 24, "blanc"], [480, 264, 24, 14, 1, "noir", 24]],
    [[478, 296, 52, 26, 24, "bois"], [480, 298, 48, 22, 2, "blanc", 24]],
    [[484, 328, 10, 10, 16, "noir"], [512, 328, 10, 10, 16, "noir"]],
  ];
  const furn = GROUPS.map((g) => {
    const xs = g.map((b) => [b[0], b[0] + b[2]]).flat(), ys = g.map((b) => [b[1], b[1] + b[3]]).flat();
    const depth = (Math.min(...xs) + Math.max(...xs)) / 2 + (Math.min(...ys) + Math.max(...ys)) / 2 + 0.1;
    return { furn: true, depth, boxes: g.map(([x, y, w, d, h, m, z0 = 0]) => ({ x, y, w, d, h, m, z0 })) };
  });
  // Un meuble collé à un mur se dessine du bon côté de ce mur : devant s'il est du côté +x / +y, derrière sinon
  furn.forEach((f) => {
    const xs = f.boxes.map((b) => [b.x, b.x + b.w]).flat(), ys = f.boxes.map((b) => [b.y, b.y + b.d]).flat();
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    segs.forEach((sg) => {
      const [ax, ay] = sg.a, [bx, by] = sg.b;
      if (sg.side) {
        if (Math.max(ay, by) <= y0 || Math.min(ay, by) >= y1) return;
        if (x0 >= ax - 2 && x0 - ax < 80) f.depth = Math.max(f.depth, sg.depth + 0.5);
        else if (x1 <= ax + 2 && ax - x1 < 80) f.depth = Math.min(f.depth, sg.depth - 0.5);
      } else {
        if (Math.max(ax, bx) <= x0 || Math.min(ax, bx) >= x1) return;
        if (y0 >= ay - 2 && y0 - ay < 80) f.depth = Math.max(f.depth, sg.depth + 0.5);
        else if (y1 <= ay + 2 && ay - y1 < 80) f.depth = Math.min(f.depth, sg.depth - 0.5);
      }
    });
  });
  const items = [...segs, ...furn].sort((p, q) => p.depth - q.depth);
  const wallG = el("g", {}, svg2);
  items.forEach((it) => {
    if (it.furn) {
      it.boxes.forEach((bx) => { bx.faces = ["fside", "fside f-y", "ftop"].map((c) => el("polygon", { class: `furn ${c} m-${bx.m}` }, wallG)); });
      return;
    }
    it.face = el("polygon", { class: "wall" + (it.side ? " side" : "") }, wallG);
    it.edge = el("path", { class: "wall-edge" }, wallG);
  });
  const planG = el("g", { class: "t-plan" }, svg2);
  el("path", { class: "door", d: "M300 170 A60 60 0 0 1 360 230 M180 200 A50 50 0 0 0 230 150" }, planG);
  el("path", { class: "dim", d: "M60 372 H540 M60 366 v12 M540 366 v12" }, planG);
  [["Chambre",205,118],["Séjour",405,214],["SdB",130,262],["Cuisine",426,312]].forEach(([s,x,y]) => { const tx = el("text", { x, y }, planG); tx.textContent = s; });
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
    furn.forEach((g) => g.boxes.forEach(({ x, y, w, d, h, z0, faces }) => {
      const b = z0 * e, z = (z0 + h) * e, P = (px, py, pz) => proj(px, py, pz, e).join(",");
      faces[0].setAttribute("points", [P(x + w, y, b), P(x + w, y + d, b), P(x + w, y + d, z), P(x + w, y, z)].join(" "));
      faces[1].setAttribute("points", [P(x, y + d, b), P(x + w, y + d, b), P(x + w, y + d, z), P(x, y + d, z)].join(" "));
      faces[2].setAttribute("points", [P(x, y, z), P(x + w, y, z), P(x + w, y + d, z), P(x, y + d, z)].join(" "));
    }));
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
