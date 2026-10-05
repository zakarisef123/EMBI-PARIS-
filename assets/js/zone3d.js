/* Maison EMBI : la partie choisie sort du plan en volume, avec ses matières (fondations, intérieur, façades, toit) */
(() => {
  const build = document.getElementById("build"), svg = document.getElementById("bpSvg");
  if (!build || !svg) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
  const C = Math.cos(Math.PI / 6), S = Math.sin(Math.PI / 6);

  // Matières : [dessus, face droite (x), face gauche (y)]
  const M = {
    terre: ["#6e5641", "#5c4735", "#4f3d2d"], beton: ["#cbc6bc", "#aaa498", "#928c80"], parpaing: ["#b9b3a7", "#9b9589", "#857f74"],
    acier: ["#8d6b55", "#76594a", "#634a3d"], enduit: ["#efe7da", "#ddd2c1", "#c7baa6"], pierre: ["#e3d6c0", "#cdbfa6", "#b8a98f"],
    vitre: ["#a9c4d4", "#86a9be", "#6f93ab"], blanc: ["#f4f1ea", "#dcd6cb", "#c7c0b3"], noir: ["#3a404b", "#2c313a", "#22262e"],
    bois: ["#c08f5e", "#a2774b", "#8a633d"], zinc: ["#8e9aa6", "#74808d", "#616c78"], brique: ["#b0674b", "#94553e", "#7d4734"],
    parquet: ["#cfa77c", "#b48d64", "#9c7853"], lit: ["#ece7dd", "#d6cfc2", "#c2baab"], tissu: ["#c8b48f", "#ad9a76", "#968462"],
    tapis: ["#8c97a8", "#76808f", "#646d7a"], plante: ["#6b8a57", "#577347", "#48613b"], metal: ["#a7afb8", "#8b939c", "#757d86"],
    eau: ["#9cc3d6", "#9cc3d6", "#9cc3d6"],
  };
  // Boîte : [x, y, z0, largeur, profondeur, hauteur, matière, étape (0 = monte en premier … 1 = en dernier)]
  const B = (x, y, z, w, d, h, m, s = 0) => ({ x, y, z, w, d, h, m, s });
  const W = 200, D = 140;

  const SCENES = {
    fondations: (() => {
      const L = [];
      // semelles filantes sous les murs, puis dalle, puis premiers rangs de parpaings et attentes d'acier
      L.push(B(-8, -8, -26, W + 16, 16, 22, "beton", 0), B(-8, -8, -26, 16, D + 16, 22, "beton", 0.05));
      L.push(B(W - 8, -8, -26, 16, D + 16, 22, "beton", 0.1), B(-8, D - 8, -26, W + 16, 16, 22, "beton", 0.15), B(92, -8, -26, 16, D + 16, 22, "beton", 0.2));
      L.push(B(-4, -4, -4, W + 8, D + 8, 8, "beton", 0.4));
      L.push(B(0, 0, 4, W, 10, 22, "parpaing", 0.6), B(0, 10, 4, 10, D - 10, 22, "parpaing", 0.65));
      L.push(B(W - 10, 10, 4, 10, D - 10, 22, "parpaing", 0.7), B(10, D - 10, 4, W - 20, 10, 22, "parpaing", 0.75), B(95, 10, 4, 10, 60, 22, "parpaing", 0.8));
      [[2, 2], [W - 8, 2], [2, D - 8], [W - 8, D - 8], [97, 2]].forEach(([x, y], i) => L.push(B(x + 2, y + 2, 26, 2, 2, 22, "acier", 0.85 + i * 0.03)));
      return { cy: 150, ground: 0, boxes: L, fp: [W, D], scale: 0.72 };
    })(),
    interieur: (() => {
      const L = [B(0, 0, -4, W, D, 4, "parquet", 0)];
      // murs du fond pleine hauteur, cloison basse, fenêtre
      L.push(B(-6, -6, -4, W + 6, 6, 74, "enduit", 0.1), B(-6, 0, -4, 6, D, 74, "enduit", 0.15), B(96, 0, 0, 5, 56, 36, "enduit", 0.25));
      L.push(B(130, -2, 22, 44, 3, 34, "vitre", 0.3));
      // chambre : lit, chevets, armoire
      L.push(B(10, 8, 0, 56, 6, 26, "bois", 0.45), B(10, 14, 0, 56, 50, 9, "bois", 0.45), B(12, 16, 9, 52, 46, 7, "lit", 0.5), B(12, 40, 16, 52, 22, 2, "tissu", 0.55));
      L.push(B(70, 8, 0, 14, 12, 14, "bois", 0.5), B(4, 74, 0, 16, 40, 52, "bois", 0.55));
      // séjour : tapis, canapé, table basse, plante, lampe
      L.push(B(112, 60, 0, 76, 50, 1, "tapis", 0.6));
      L.push(B(120, 8, 0, 64, 8, 22, "tissu", 0.65), B(120, 14, 0, 64, 20, 10, "tissu", 0.65), B(120, 14, 0, 6, 20, 16, "tissu", 0.7), B(178, 14, 0, 6, 20, 16, "tissu", 0.7));
      L.push(B(136, 70, 0, 32, 20, 9, "bois", 0.75), B(186, 116, 0, 10, 10, 8, "bois", 0.8), B(184, 114, 8, 14, 14, 24, "plante", 0.85));
      // coin repas
      L.push(B(40, 104, 0, 44, 24, 18, "bois", 0.8), B(44, 96, 0, 8, 6, 12, "noir", 0.85), B(70, 96, 0, 8, 6, 12, "noir", 0.85), B(56, 66, 40, 8, 8, 4, "metal", 0.9));
      [0, 1, 2, 4].forEach((n, i) => (L[n].back = i - 10)); // murs du fond toujours dessinés en premier
      return { cy: 160, boxes: L, scale: 0.7 };
    })(),
    exterieur: (() => {
      const L = [B(0, 0, 0, W - 40, D - 30, 118, "pierre", 0)];
      const X = W - 40, Y = D - 30;
      // corniche et soubassement
      L.push(B(-2, -2, 118, X + 4, Y + 4, 5, "blanc", 0.2), B(0, 0, 0, X + 1, Y + 1, 10, "beton", 0.1));
      // fenêtres : face droite (x = X) et face avant (y = Y), avec appui blanc
      const winX = (y, z, w, h, s) => L.push(B(X, y, z, 2, w, h, "vitre", s), B(X, y - 2, z - 3, 5, w + 4, 3, "blanc", s));
      const winY = (x, z, w, h, s) => L.push(B(x, Y, z, w, 2, h, "vitre", s), B(x - 2, Y, z - 3, w + 4, 5, 3, "blanc", s));
      [[14, 30], [64, 30]].forEach(([y], i) => { winX(y, 22, 24, 34, 0.35 + i * 0.05); winX(y, 76, 24, 30, 0.5 + i * 0.05); });
      [[16], [104]].forEach(([x], i) => winY(x, 22, 26, 34, 0.4 + i * 0.05));
      L.push(B(62, Y, 0, 28, 3, 50, "bois", 0.45));
      [[16], [60], [104]].forEach(([x], i) => winY(x, 76, 26, 30, 0.55 + i * 0.04));
      // balcon : dalle + garde-corps
      L.push(B(50, Y, 64, 60, 14, 4, "beton", 0.65), B(50, Y + 12, 68, 60, 2, 14, "noir", 0.7), B(108, Y + 2, 68, 2, 12, 14, "noir", 0.7));
      // échafaudage sur la face droite : montants, planchers, diagonale
      const SX = X + 10;
      [0, 50, 100].forEach((y, i) => [0, 14].forEach((dx) => L.push(B(SX + dx, y, 0, 2, 2, 132, "metal", 0.75 + i * 0.03))));
      [40, 86, 128].forEach((z, i) => L.push(B(SX - 2, 0, z, 18, 102, 3, "bois", 0.85 + i * 0.04)));
      return { cy: 200, ground: 30, boxes: L, scale: 0.6 };
    })(),
    toit: (() => {
      const X = W - 40, Y = D - 30;
      const L = [B(0, 0, 0, X, Y, 30, "pierre", 0), B(-2, -2, 30, X + 4, Y + 4, 4, "blanc", 0.1)];
      // fermes de charpente (montent avant la couverture), cheminée en brique
      for (let i = 0; i <= 6; i++) L.push(B(i * (X - 4) / 6, Y / 2 - 1, 34, 4, 2, 44, "bois", 0.2 + i * 0.03));
      L.push(B(0, Y / 2 - 1, 76, X, 3, 3, "bois", 0.4));
      L.push(B(104, 18, 60, 16, 16, 40, "brique", 0.9), B(102, 16, 100, 20, 20, 3, "beton", 0.92));
      return { cy: 172, boxes: L, scale: 0.74, roof: { X, Y, z: 34, h: 46, s: 0.55 } };
    })(),
  };

  const ease = (t) => t * t * (3 - 2 * t), cl = (t) => Math.min(Math.max(t, 0), 1);
  let raf = null;
  const render = (zone) => {
    cancelAnimationFrame(raf);
    svg.querySelector(".v3")?.remove();
    const sc = SCENES[zone];
    if (!sc) return;
    const k = sc.scale || 0.82, [fw, fd] = sc.fp || [sc.boxes[0].w, sc.boxes[0].d], ox = fw / 2, oy = fd / 2;
    // plan (vue de dessus, centré) → axonométrie
    const proj = (x, y, z, t) => {
      const px = 200 + (x - ox) * 0.95, py = 120 + (y - oy) * 0.95;
      const ix = 200 + ((x - ox) - (y - oy)) * C * k, iy = sc.cy - 30 + ((x - ox) + (y - oy)) * S * k - z * k;
      return [px + (ix - px) * t, py + (iy - py) * t].map((n) => n.toFixed(1)).join(",");
    };
    const g = el("g", { class: "v3" }, svg);
    const ground = sc.ground !== undefined && el("polygon", { style: "fill:rgba(255,255,255,.06);stroke:rgba(255,255,255,.18);stroke-width:1" }, g);
    const items = sc.boxes.map((b) => ({ ...b, depth: b.back ?? b.x + b.w / 2 + b.y + b.d / 2 + (b.z + b.h / 2) * 0.6 }));
    if (sc.roof) items.push({ roof: true, depth: 1e6, s: sc.roof.s });
    items.sort((p, q) => p.depth - q.depth);
    items.forEach((it) => {
      if (it.roof) {
        it.g = el("g", {}, g);
        it.back = el("polygon", { style: `fill:${M.zinc[2]};stroke:${M.zinc[2]};stroke-width:.6` }, it.g);
        it.gable = el("polygon", { style: `fill:${M.pierre[1]};stroke:${M.pierre[1]};stroke-width:.6` }, it.g);
        it.front = el("polygon", { style: `fill:${M.zinc[0]};stroke:${M.zinc[0]};stroke-width:.6` }, it.g);
        it.seams = el("path", { style: "fill:none;stroke:rgba(20,35,63,.35);stroke-width:.8" }, it.g);
        it.lucarne = el("polygon", { style: `fill:${M.vitre[1]};stroke:${M.blanc[0]};stroke-width:1.4` }, it.g);
        it.gutter = el("polyline", { style: `fill:none;stroke:${M.zinc[2]};stroke-width:2.2` }, it.g);
        return;
      }
      const [top, sx, sy] = M[it.m];
      it.f = [sx, sy, top].map((c) => el("polygon", { style: `fill:${c};stroke:${c};stroke-width:.6;stroke-linejoin:round` }, g));
      if (it.m === "eau") it.f.forEach((p) => p.style.opacity = 0.8);
    });
    const draw = (q) => {
      const t = ease(cl(q / 0.45));
      if (ground) {
        const pad = 30, x0 = -pad, y0 = -pad, x1 = fw + pad + sc.ground, y1 = fd + pad;
        ground.setAttribute("points", [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => proj(x, y, 0, t)).join(" "));
        ground.style.opacity = t;
      }
      items.forEach((it) => {
        const r = ease(cl((q - 0.3 - it.s * 0.45) / 0.25));
        if (it.roof) {
          const { X, Y, z, h } = sc.roof, hh = h * r, o = 6;
          it.g.style.opacity = Math.min(1, r * 3);
          it.back.setAttribute("points", [proj(-o, -o, z - 4, t), proj(X + o, -o, z - 4, t), proj(X + o, Y / 2, z + hh, t), proj(-o, Y / 2, z + hh, t)].join(" "));
          it.gable.setAttribute("points", [proj(X, 0, z, t), proj(X, Y, z, t), proj(X, Y / 2, z + hh, t)].join(" "));
          it.front.setAttribute("points", [proj(-o, Y / 2, z + hh, t), proj(X + o, Y / 2, z + hh, t), proj(X + o, Y + o, z - 4, t), proj(-o, Y + o, z - 4, t)].join(" "));
          let d = "";
          for (let i = 1; i < 10; i++) { const x = -o + ((X + 2 * o) * i) / 10; d += `M${proj(x, Y / 2, z + hh, t)} L${proj(x, Y + o, z - 4, t)} `; }
          it.seams.setAttribute("d", d);
          const lu = (u, v) => proj(40 + u, Y / 2 + (Y / 2 + o) * v, z + hh - (hh + 4) * v, t);
          it.lucarne.setAttribute("points", [lu(0, 0.35), lu(22, 0.35), lu(22, 0.7), lu(0, 0.7)].join(" "));
          it.gutter.setAttribute("points", [proj(-o, Y + o, z - 4, t), proj(X + o, Y + o, z - 4, t)].join(" "));
          return;
        }
        const { x, y, w, d } = it, b = it.z, top = it.z + it.h * r;
        it.f.forEach((p) => (p.style.opacity = Math.min(1, r * 4)));
        it.f[0].setAttribute("points", [proj(x + w, y, b, t), proj(x + w, y + d, b, t), proj(x + w, y + d, top, t), proj(x + w, y, top, t)].join(" "));
        it.f[1].setAttribute("points", [proj(x, y + d, b, t), proj(x + w, y + d, b, t), proj(x + w, y + d, top, t), proj(x, y + d, top, t)].join(" "));
        it.f[2].setAttribute("points", [proj(x, y, top, t), proj(x + w, y, top, t), proj(x + w, y + d, top, t), proj(x, y + d, top, t)].join(" "));
      });
    };
    const bp = document.getElementById("bp"), scale = bp && bp.querySelector(".bp__scale");
    if (scale) scale.textContent = "Éch. 1:50 · EMBI";
    bp && bp.classList.remove("is-vol");
    draw(0);
    if (reduce) { draw(1); bp && bp.classList.add("is-vol"); if (scale) scale.textContent = "Volume · EMBI"; return; }
    // le plan se dessine d'abord, puis il s'efface et la partie sort en volume
    const t0 = performance.now() + 1500, dur = 3200;
    const tick = (now) => {
      const q = cl((now - t0) / dur);
      if (q > 0 && bp && !bp.classList.contains("is-vol")) { bp.classList.add("is-vol"); if (scale) scale.textContent = "Volume · EMBI"; }
      draw(q);
      if (q < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  };

  const current = () => build.querySelector(".build__chip.is-on")?.dataset.z;
  build.addEventListener("embi:zone", (e) => build.classList.contains("is-drawn") && render(e.detail));
  new IntersectionObserver((en, obs) => {
    if (!en[0].isIntersecting) return;
    obs.disconnect();
    render(current());
  }, { threshold: 0.3 }).observe(build);
})();
