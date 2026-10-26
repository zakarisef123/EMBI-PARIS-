/* « Du plan à l'appartement » : maquette 3D construite à partir des vrais plans de l'architecte
   (assets/maquettes/<chantier>/ : scene.json + calques du plan, préparés par scripts/maquettes/).
   Le plan, puis la démolition, l'électricité et les sols se posent dessus ; les murs montent, les meubles
   prennent place, la lumière entre par les fenêtres ; enfin tous les plans réunis, et les photos du chantier livré. */
import * as THREE from "./vendor/three.module.min.js";
import { RoomEnvironment } from "./vendor/RoomEnvironment.js";
import { RoundedBoxGeometry } from "./vendor/RoundedBoxGeometry.js";

const root = document.querySelector("[data-maquette]");
if (root) start(root);

function start(root) {
  const id = root.dataset.maquette;
  const BASE = `/assets/maquettes/${id}/`;
  const record = new URLSearchParams(location.search).has("enregistrement");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stage = root.querySelector(".mq__stage");
  const caption = root.querySelector(".mq__caption");
  const chipsBox = root.querySelector(".mq__steps");
  const photos = [...root.querySelectorAll(".mq__photo")];
  const replay = root.querySelector(".mq__replay");

  // ───── étapes (secondes) ─────
  const STEPS = [
    ["plan", 0, "Le plan", "Le plan d'aménagement dessiné par notre architecte, à l'échelle."],
    ["demolition", 3, "Démolition", "En jaune, les cloisons démolies ; en rouge, les nouvelles cloisons."],
    ["electricite", 6.5, "Électricité", "Points lumineux, prises et circuits, d'après le plan électrique."],
    ["sols", 10, "Sols", "Parquet en point de Hongrie, parquet droit et travertin 60 × 120, d'après le calepinage."],
    ["volume", 13, "Les murs", "Les murs montent à partir du plan : fenêtres, portes et balcon filant."],
    ["mobilier", 17.5, "Mobilier", "Chaque meuble à sa place, d'après le plan d'aménagement."],
    ["lumiere", 21.5, "Lumière", "Le soleil entre par les fenêtres, les luminaires du plan électrique s'allument."],
    ["complet", 26, "Plan complet", "Tous les plans réunis en un seul : démolition, électricité, sols, murs et mobilier."],
    ["resultat", 30.5, "Le résultat", "Et voici l'appartement, une fois livré par EMBI."],
  ];
  const DUR = 37.5;
  chipsBox.innerHTML = STEPS.map(([k, , l], i) => `<button type="button" class="mq__step" data-i="${i}"><span>${String(i + 1).padStart(2, "0")}</span>${l}</button>`).join("");
  const chips = [...chipsBox.querySelectorAll(".mq__step")];

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (v) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
  const span = (t, a, b) => ease(clamp((t - a) / (b - a)));

  // ───── moteur ─────
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: record, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(record ? 1 : 1.75, devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled = true;
  stage.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xd9d0c0);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(32, 16 / 9, 0.1, 200);

  const loader = new THREE.TextureLoader();
  const tex = (f, srgb = true) => new Promise((ok) => loader.load(BASE + f, (t) => { if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; ok(t); }));

  const ready = Promise.all([fetch(BASE + "scene.json").then((r) => r.json()), tex("papier.webp"), tex("sol.webp"), tex("demolition.webp"), tex("electricite.webp"), tex("ombre.webp")]).then(build);
  window.__maquette = { ready, seek: (t) => ready.then(() => { T = t; frame(t); }) };

  let T = 0, playing = false, last = 0, M = null;

  function build([S, papier, sol, demo, elec, ombre]) {
    const W = S.w, H = S.h, HGT = S.hauteur || 2.4, cx = W / 2, cz = H / 2;
    const mat = (o) => new THREE.MeshStandardMaterial({ envMapIntensity: 0.55, ...o });
    const MAT = {
      platre: mat({ color: 0xf3f0ea, roughness: 0.93 }),
      coupe: mat({ color: 0x14233f, roughness: 0.75 }),
      chene: mat({ color: 0xc39a6b, roughness: 0.62 }),
      chene_fonce: mat({ color: 0x9a7350, roughness: 0.6 }),
      blanc: mat({ color: 0xf4f3ef, roughness: 0.38 }),
      greige: mat({ color: 0xd6cfc4, roughness: 0.55 }),
      bleu: mat({ color: 0x6f8ca3, roughness: 0.5 }),
      tissu: mat({ color: 0xcfc7bb, roughness: 1 }),
      tissu_fonce: mat({ color: 0x8b8378, roughness: 1 }),
      linge: mat({ color: 0xf6f5f2, roughness: 0.95 }),
      tapis: mat({ color: 0xd8d0c2, roughness: 1 }),
      marbre: mat({ color: 0xf2f1ee, roughness: 0.18 }),
      noir: mat({ color: 0x1d1d1f, roughness: 0.35, metalness: 0.4 }),
      ceramique: mat({ color: 0xfbfbfa, roughness: 0.12 }),
      travertin: mat({ color: 0xd9c9ab, roughness: 0.45 }),
      pierre: mat({ color: 0xd8d1c3, roughness: 0.85 }),
      fer: mat({ color: 0x2a2a2c, roughness: 0.45, metalness: 0.7 }),
      chrome: mat({ color: 0xd9d9d9, roughness: 0.15, metalness: 1 }),
      laiton: mat({ color: 0xc9a25a, roughness: 0.3, metalness: 1 }),
      vert: mat({ color: 0x4f6b3a, roughness: 0.8 }),
      vert2: mat({ color: 0x6d8a4c, roughness: 0.8 }),
      terre: mat({ color: 0xb57a52, roughness: 0.9 }),
      verre: new THREE.MeshPhysicalMaterial({ color: 0xdbeaf0, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.22, depthWrite: false }),
      miroir: mat({ color: 0xdfe6ea, roughness: 0.05, metalness: 1 }),
      four: mat({ color: 0x18181a, roughness: 0.2, metalness: 0.3 }),
    };
    // tout porte ombre, sauf le verre (le soleil passe par les fenêtres)
    const shadows = (o) => o.traverse((m) => { if (m.isMesh) { m.castShadow = m.material !== MAT.verre; m.receiveShadow = true; } });

    // table de travail, plan papier, sols, calques
    const table = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), mat({ color: 0xd9d0c0, roughness: 1 }));
    table.rotation.x = -Math.PI / 2; table.position.set(cx, -0.03, cz); table.receiveShadow = true; scene.add(table);
    const plane = (t, y, o = {}) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshStandardMaterial({ map: t, roughness: 0.95, ...o }));
      m.rotation.x = -Math.PI / 2; m.position.set(cx, y, cz); m.receiveShadow = true; scene.add(m); return m;
    };
    // ombre douce de la feuille sur la table
    const soft = (() => { const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d"); x.filter = "blur(6px)"; x.fillStyle = "#000"; x.fillRect(12, 12, 40, 40); const t = new THREE.CanvasTexture(c); return t; })();
    const drop = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.12, H * 1.16), new THREE.MeshBasicMaterial({ map: soft, transparent: true, opacity: 0.32, depthWrite: false, color: 0x2a2116 }));
    drop.rotation.x = -Math.PI / 2; drop.position.set(cx + 0.08, -0.02, cz + 0.14); scene.add(drop);
    const paper = plane(papier, 0);
    const solCut = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
    const floor = plane(sol, 0.004, { alphaTest: 0.5, roughness: 0.55, clippingPlanes: [solCut] });
    const ao = plane(ombre, 0.008, { transparent: true, opacity: 0, depthWrite: false, roughness: 1 });
    ao.receiveShadow = false;
    const demoL = plane(demo, 0.012, { transparent: true, opacity: 0, depthWrite: false });
    const elecL = plane(elec, 0.014, { transparent: true, opacity: 0, depthWrite: false });
    [demoL, elecL].forEach((m) => { m.receiveShadow = false; m.renderOrder = 2; });

    // murs extrudés depuis le plan (dessus coupé en bleu EMBI)
    const walls = new THREE.Group(); scene.add(walls);
    for (const w of S.walls) {
      const sh = new THREE.Shape(w.outer.map(([x, y]) => new THREE.Vector2(x, -y)));
      for (const h of w.holes) sh.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, -y))));
      const g = new THREE.ExtrudeGeometry(sh, { depth: HGT, bevelEnabled: false, curveSegments: 1 });
      g.rotateX(-Math.PI / 2);
      const m = new THREE.Mesh(g, [MAT.coupe, MAT.platre]); walls.add(m);
    }
    // fenêtres : allège, vitrage, linteau
    for (const f of S.windows) {
      const g = new THREE.Group(); g.position.set(f.x, 0, f.y); g.rotation.y = -f.a;
      const d = Math.max(0.12, f.d * 0.96), w = f.w;
      const box = (sx, sy, sz, m, y) => { const b = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m); b.position.y = y + sy / 2; g.add(b); return b; };
      box(w, 0.9, d, MAT.platre, 0); box(w, HGT - 2.15, d, MAT.platre, 2.15);
      const top = box(w, 0.012, d, MAT.coupe, HGT); top.position.y = HGT + 0.006;
      box(w * 0.98, 1.2, 0.03, MAT.verre, 0.93);
      box(w, 0.05, d * 0.6, MAT.blanc, 0.9); box(0.05, 1.25, d * 0.5, MAT.blanc, 0.9);
      walls.add(g);
    }
    // portes : linteau au-dessus du passage, chambranle blanc
    for (const p of S.doors) {
      const g = new THREE.Group(); g.position.set(p.x, 0, p.y); g.rotation.y = -p.a;
      const d = Math.max(0.1, p.d), w = p.w;
      const box = (sx, sy, sz, m, x, y) => { const b = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m); b.position.set(x, y + sy / 2, 0); g.add(b); return b; };
      box(w, HGT - 2.15, d, MAT.platre, 0, 2.15);
      const top = box(w, 0.012, d, MAT.coupe, 0, HGT); top.position.y = HGT + 0.006;
      box(w + 0.1, 0.07, d + 0.03, MAT.blanc, 0, 2.08); box(0.05, 2.15, d + 0.03, MAT.blanc, -w / 2 + 0.025, 0); box(0.05, 2.15, d + 0.03, MAT.blanc, w / 2 - 0.025, 0);
      walls.add(g);
    }
    // balcon filant : dalle de pierre et garde-corps en fer forgé
    if (S.balcon) {
      const [x0, y0, x1, y1] = S.balcon.r, L = x1 - x0, D = y1 - y0;
      const bal = new THREE.Group(); bal.position.set(x0 + L / 2, 0, y0 + D / 2);
      const slab = new THREE.Mesh(new THREE.BoxGeometry(L, 0.1, D), MAT.pierre); slab.position.y = 0.0; bal.add(slab);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(L, 0.05, 0.05), MAT.fer); rail.position.set(0, 1.0, -D / 2 + 0.04); bal.add(rail);
      const rail2 = rail.clone(); rail2.position.y = 0.12; bal.add(rail2);
      const n = Math.floor(L / 0.13), bar = new THREE.InstancedMesh(new THREE.BoxGeometry(0.018, 0.88, 0.018), MAT.fer, n), m4 = new THREE.Matrix4();
      for (let i = 0; i < n; i++) { m4.makeTranslation(-L / 2 + (i + 0.5) * (L / n), 0.56, -D / 2 + 0.04); bar.setMatrixAt(i, m4); }
      bal.add(bar); walls.add(bal);
    }
    shadows(walls);

    // ───── mobilier ─────
    const R = (r) => ({ x0: r[0], z0: r[1], x1: r[2], z1: r[3], sx: r[2] - r[0], sz: r[3] - r[1], cx: (r[0] + r[2]) / 2, cz: (r[1] + r[3]) / 2 });
    const FACE = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
    const furn = [];
    const piece = (cxp, czp) => { const g = new THREE.Group(); g.position.set(cxp, 0, czp); scene.add(g); furn.push(g); return g; };
    const rb = (g, sx, sy, sz, m, x, y, z, r = 0.02) => {
      const geo = r > 0 ? new RoundedBoxGeometry(sx, sy, sz, 2, Math.min(r, sx / 2, sy / 2, sz / 2)) : new THREE.BoxGeometry(sx, sy, sz);
      const b = new THREE.Mesh(geo, m); b.position.set(x, y + sy / 2, z); g.add(b); return b;
    };
    const cyl = (g, r1, r2, h, m, x, y, z, seg = 24) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m); c.position.set(x, y + h / 2, z); g.add(c); return c; };
    // un rectangle « contre le mur » : axe le long du mur et profondeur, selon l'orientation de la face
    const along = (r, face) => (face === "n" || face === "s" ? [r.sx, r.sz] : [r.sz, r.sx]);
    const B = {
      cheminee(it) {
        const r = R(it.r), g = piece(r.cx, r.cz); const [f0, f1] = FACE[it.face];
        rb(g, r.sx, HGT, r.sz, MAT.platre, 0, 0, 0, 0);
        const top = rb(g, r.sx, 0.012, r.sz, MAT.coupe, 0, HGT, 0, 0);
        const [len] = along(r, it.face), wM = Math.min(1.35, len * 0.8);
        const off = (it.face === "e" || it.face === "w" ? r.sx : r.sz) / 2 + 0.08;
        const mg = new THREE.Group(); mg.position.set(f0 * off, 0, f1 * off); mg.rotation.y = Math.atan2(f0, f1); g.add(mg);
        rb(mg, wM, 1.08, 0.16, MAT.marbre, 0, 0, 0, 0.01);
        rb(mg, wM * 0.55, 0.62, 0.06, MAT.noir, 0, 0.06, 0.06, 0.005);
        rb(mg, wM + 0.08, 0.05, 0.22, MAT.marbre, 0, 1.08, 0, 0.01);
        rb(mg, wM * 0.8, 0.85, 0.03, MAT.laiton, 0, 1.25, -0.06, 0.01);
        rb(mg, wM * 0.72, 0.75, 0.02, MAT.miroir, 0, 1.3, -0.04, 0.005);
        return g;
      },
      cuisine(it) {
        const r = R(it.r), g = piece(r.cx, r.cz); const [f0, f1] = FACE[it.face];
        rb(g, r.sx, 0.86, r.sz, MAT.blanc, 0, 0.04, 0, 0.01); rb(g, r.sx * 0.98, 0.04, r.sz * 0.9, MAT.noir, 0, 0, 0, 0);
        rb(g, r.sx + 0.02, 0.035, r.sz + 0.02, MAT.marbre, 0, 0.9, 0, 0.005);
        rb(g, 0.6, 0.006, 0.52, MAT.noir, r.sx * 0.15, 0.935, 0, 0.002);
        rb(g, 0.5, 0.02, 0.4, MAT.chrome, -r.sx * 0.22, 0.925, 0, 0.01);
        const back = -f1 * (r.sz / 2 - 0.18);
        rb(g, r.sx * 0.92, 0.72, 0.36, MAT.chene, 0, 1.45, back, 0.01);
        if (it.colonne) { const c = R(it.colonne), cg = piece(c.cx, c.cz); rb(cg, c.sx, 2.2, c.sz, MAT.blanc, 0, 0, 0, 0.01); rb(cg, c.sx * 0.8, 0.58, 0.02, MAT.four, 0, 0.9, f1 * (c.sz / 2 + 0.005), 0.005); }
        return g;
      },
      table(it) {
        const r = R(it.r), g = piece(r.cx, r.cz);
        const top = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.04, 48), MAT.chene); top.scale.set(r.sx, 1, r.sz); top.position.y = 0.74; g.add(top);
        cyl(g, 0.05, 0.08, 0.72, MAT.chene_fonce, -r.sx * 0.28, 0, 0); cyl(g, 0.05, 0.08, 0.72, MAT.chene_fonce, r.sx * 0.28, 0, 0);
        cyl(g, 0.22, 0.22, 0.02, MAT.chene_fonce, -r.sx * 0.28, 0, 0); cyl(g, 0.22, 0.22, 0.02, MAT.chene_fonce, r.sx * 0.28, 0, 0);
        const v = cyl(g, 0.07, 0.05, 0.18, MAT.blanc, 0, 0.76, 0); v.scale.set(1, 1, 1);
        return g;
      },
      chaise(it) {
        const g = piece(it.p[0], it.p[1]); const [f0, f1] = FACE[it.face]; g.rotation.y = Math.atan2(f0, f1);
        rb(g, 0.44, 0.05, 0.44, MAT.chene, 0, 0.43, 0, 0.015);
        rb(g, 0.42, 0.04, 0.4, MAT.tissu, 0, 0.475, 0.01, 0.015);
        rb(g, 0.44, 0.38, 0.04, MAT.chene, 0, 0.52, -0.2, 0.015);
        for (const [x, z] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]]) cyl(g, 0.016, 0.016, 0.43, MAT.chene_fonce, x, 0, z, 8);
        return g;
      },
      tapis(it) { const r = R(it.r), g = piece(r.cx, r.cz); rb(g, r.sx, 0.012, r.sz, MAT.tapis, 0, 0.005, 0, 0.004); return g; },
      table_basse(it) { const r = R(it.r), g = piece(r.cx, r.cz); const t = cyl(g, 0.38, 0.38, 0.04, MAT.chene, 0, 0.36, 0, 40); cyl(g, 0.3, 0.3, 0.36, MAT.chene_fonce, 0, 0, 0, 40); cyl(g, 0.06, 0.06, 0.12, MAT.vert2, 0.1, 0.4, 0.05, 12); return g; },
      canape(it) {
        const a = R(it.a), b = R(it.b); const g = piece(0, 0);
        for (const r of [a, b]) rb(g, r.sx, 0.42, r.sz, MAT.tissu, r.cx, 0.02, r.cz, 0.07);
        if (it.dos.includes("w")) rb(g, 0.2, 0.42, a.sz, MAT.tissu, a.x0 + 0.1, 0.42, a.cz, 0.08);
        if (it.dos.includes("s")) rb(g, b.sx, 0.42, 0.2, MAT.tissu, b.cx, 0.42, b.z1 - 0.1, 0.08);
        rb(g, 0.45, 0.32, 0.12, MAT.tissu_fonce, a.x0 + 0.3, 0.44, a.z0 + 0.45, 0.05);
        rb(g, 0.45, 0.32, 0.12, MAT.linge, b.x1 - 0.5, 0.44, b.z1 - 0.3, 0.05);
        return g;
      },
      plante(it) {
        const g = piece(it.p[0], it.p[1]); cyl(g, 0.17, 0.13, 0.42, MAT.blanc, 0, 0, 0, 24);
        const leaf = new THREE.IcosahedronGeometry(0.22, 1);
        [[0, 0.75, 0, 1.2], [0.13, 0.95, 0.06, 0.9], [-0.12, 1.05, -0.05, 0.85], [0.03, 1.25, 0.08, 0.7], [-0.05, 0.6, 0.12, 0.8]].forEach(([x, y, z, s], i) => { const m = new THREE.Mesh(leaf, i % 2 ? MAT.vert : MAT.vert2); m.position.set(x, y, z); m.scale.setScalar(s); g.add(m); });
        return g;
      },
      lit(it) {
        const r = R(it.r), g = piece(r.cx, r.cz); const [f0, f1] = FACE[it.tete];
        rb(g, r.sx, 0.28, r.sz, MAT.chene, 0, 0.04, 0, 0.02);
        rb(g, r.sx * 0.98, 0.22, r.sz * 0.98, MAT.linge, 0, 0.3, 0, 0.06);
        const vert = it.tete === "e" || it.tete === "w";
        const len = vert ? r.sx : r.sz, wid = vert ? r.sz : r.sx;
        const duvet = rb(g, vert ? len * 0.68 : wid * 1.0, 0.06, vert ? wid * 1.0 : len * 0.68, MAT.tissu, -f0 * len * 0.15, 0.5, -f1 * len * 0.15, 0.03);
        for (const s of [-0.25, 0.25]) rb(g, vert ? 0.32 : wid * 0.42, 0.14, vert ? wid * 0.42 : 0.32, MAT.linge, f0 * (len / 2 - 0.25) + (vert ? 0 : s * wid), 0.5, f1 * (len / 2 - 0.25) + (vert ? s * wid : 0), 0.06);
        rb(g, vert ? 0.08 : wid, 1.0, vert ? wid : 0.08, MAT.tissu_fonce, f0 * (len / 2 + 0.02), 0, f1 * (len / 2 + 0.02), 0.03);
        return g;
      },
      lit_superpose(it) {
        const r = R(it.r), g = piece(r.cx, r.cz);
        for (const y of [0.25, 1.35]) { rb(g, r.sx, 0.12, r.sz, MAT.chene, 0, y, 0, 0.02); rb(g, r.sx * 0.97, 0.16, r.sz * 0.95, MAT.linge, 0, y + 0.12, 0, 0.05); rb(g, r.sx * 0.6, 0.05, r.sz * 0.96, MAT.bleu, r.sx * 0.15, y + 0.28, 0, 0.02); }
        for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) rb(g, 0.06, 1.75, 0.06, MAT.chene, x * (r.sx / 2 - 0.03), 0, z * (r.sz / 2 - 0.03), 0.01);
        rb(g, r.sx, 0.2, 0.04, MAT.chene, 0, 1.6, r.sz / 2 - 0.02, 0.01);
        return g;
      },
      armoire(it) {
        const r = R(it.r), g = piece(r.cx, r.cz), z = it.z || 0;
        rb(g, r.sx, it.h, r.sz, MAT[it.m] || MAT.blanc, 0, z, 0, 0.012);
        if (it.h > 1.5) { const n = Math.max(1, Math.round(Math.max(r.sx, r.sz) / 0.55)); const lng = r.sx > r.sz; for (let i = 1; i < n; i++) { const p = -0.5 + i / n; rb(g, lng ? 0.008 : r.sx + 0.004, it.h * 0.96, lng ? r.sz + 0.004 : 0.008, MAT.chene_fonce, lng ? p * r.sx : 0, z + it.h * 0.02, lng ? 0 : p * r.sz, 0); } }
        return g;
      },
      bureau(it) {
        const r = R(it.r), g = piece(r.cx, r.cz);
        rb(g, r.sx, 0.035, r.sz, MAT.chene, 0, 0.72, 0, 0.01);
        for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) rb(g, 0.035, 0.72, 0.035, MAT.noir, x * (r.sx / 2 - 0.04), 0, z * (r.sz / 2 - 0.04), 0.005);
        cyl(g, 0.07, 0.07, 0.02, MAT.noir, 0, 0.755, -r.sz * 0.3, 16); cyl(g, 0.008, 0.008, 0.35, MAT.noir, 0, 0.77, -r.sz * 0.3, 6); cyl(g, 0.02, 0.08, 0.1, MAT.blanc, 0, 1.08, -r.sz * 0.3, 16);
        return g;
      },
      vasque(it) {
        const r = R(it.r), g = piece(r.cx, r.cz); const [f0, f1] = FACE[it.face];
        rb(g, r.sx, 0.5, r.sz, MAT.chene, 0, 0.35, 0, 0.01); rb(g, r.sx * 0.95, 0.06, r.sz * 0.85, MAT.ceramique, 0, 0.85, 0, 0.02);
        const m = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.02, 48), MAT.miroir); m.rotation.z = f0 ? Math.PI / 2 : 0; m.rotation.x = f1 ? Math.PI / 2 : 0; m.position.set(-f0 * (r.sx / 2 - 0.01), 1.45, -f1 * (r.sz / 2 - 0.01)); g.add(m);
        return g;
      },
      baignoire(it) { const r = R(it.r), g = piece(r.cx, r.cz); rb(g, r.sx, 0.56, r.sz, MAT.travertin, 0, 0, 0, 0.01); rb(g, r.sx * 0.86, 0.04, r.sz * 0.92, MAT.ceramique, 0, 0.53, 0, 0.12); rb(g, r.sx * 0.7, 0.01, r.sz * 0.8, mat({ color: 0xcfe2e6, roughness: 0.05 }), 0, 0.565, 0, 0.1); return g; },
      douche(it) {
        const r = R(it.r), g = piece(r.cx, r.cz);
        rb(g, r.sx, 0.03, r.sz, MAT.travertin, 0, 0, 0, 0.005);
        rb(g, 0.012, 2.0, r.sz * 0.98, MAT.verre, -r.sx / 2 + 0.01, 0.03, 0, 0);
        rb(g, r.sx, 2.0, 0.03, MAT.travertin, 0, 0.03, r.sz / 2 - 0.015, 0); rb(g, 0.03, 2.0, r.sz, MAT.travertin, r.sx / 2 - 0.015, 0.03, 0, 0);
        cyl(g, 0.11, 0.11, 0.015, MAT.chrome, r.sx * 0.15, 2.0, r.sz * 0.2, 24); cyl(g, 0.012, 0.012, 0.9, MAT.chrome, r.sx / 2 - 0.05, 1.1, r.sz * 0.2, 8);
        return g;
      },
      wc(it) { const g = piece(it.p[0], it.p[1]); const [f0, f1] = FACE[it.face]; g.rotation.y = Math.atan2(f0, f1); rb(g, 0.38, 0.34, 0.54, MAT.ceramique, 0, 0.28, 0.05, 0.14); rb(g, 0.5, 1.05, 0.12, MAT.blanc, 0, 0, -0.26, 0.01); rb(g, 0.16, 0.1, 0.012, MAT.chrome, 0, 0.95, -0.195, 0.004); return g; },
      lave_mains(it) { const r = R(it.r), g = piece(r.cx, r.cz); rb(g, r.sx, 0.32, r.sz, MAT.chene, 0, 0.55, 0, 0.01); rb(g, r.sx * 0.9, 0.05, r.sz * 0.9, MAT.ceramique, 0, 0.87, 0, 0.02); return g; },
    };
    for (const it of S.mobilier) if (B[it.t]) B[it.t](it);
    furn.forEach((g) => { shadows(g); g.userData.d = Math.hypot(g.position.x - cx, g.position.z - cz); });
    const dmax = Math.max(...furn.map((g) => g.userData.d)) || 1;

    // ───── lumières ─────
    const hemi = new THREE.HemisphereLight(0xffffff, 0xb9a98e, 0.5); scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff1dc, 2.4);
    sun.castShadow = true; sun.shadow.mapSize.set(record ? 2048 : 2048, record ? 2048 : 2048);
    const sc = sun.shadow.camera; sc.left = -10; sc.right = 10; sc.top = 10; sc.bottom = -10; sc.near = 1; sc.far = 60;
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
    sun.target.position.set(cx, 0, cz); scene.add(sun, sun.target);
    // points lumineux du plan électrique : une flaque de lumière chaude au sol
    const glowTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d"); const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,206,140,0.85)"); gr.addColorStop(0.4, "rgba(255,190,115,0.3)"); gr.addColorStop(1, "rgba(255,185,105,0)"); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
    const lamps = [];
    for (const [x, y] of S.lights) {
      const g = new THREE.Group(); g.position.set(x, 0, y); scene.add(g);
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
      glow.rotation.x = -Math.PI / 2; glow.position.y = 0.02; glow.renderOrder = 3; g.add(glow);
      lamps.push({ g, glow });
    }

    const mats = new Set(); scene.traverse((o) => { if (o.isMesh && o.material && o.material.isMeshStandardMaterial) mats.add(o.material); });
    M = { W, H, HGT, cx, cz, walls, furn, dmax, floor, solCut, ao, demoL, elecL, paper, sun, hemi, lamps, mats };
    resize();
    frame(T);
    if (!record) io.observe(root);
    return true;
  }

  // ───── une image du film, au temps t ─────
  function frame(t) {
    if (!M) return;
    const { W, H, cx, cz } = M;
    // calques sur le plan
    // (pour le plan complet, les calques de démolition et d'électricité se posent par-dessus la maquette)
    M.demoL.material.opacity = 0.95 * (span(t, 3, 3.8) - span(t, 6.3, 7.1)) + 0.9 * span(t, 26.6, 27.6) - 0.9 * span(t, 30.5, 31.2);
    M.elecL.material.opacity = 0.95 * (span(t, 6.5, 7.4) - span(t, 9.8, 10.8)) + 0.75 * span(t, 27, 28) - 0.75 * span(t, 30.5, 31.2);
    M.demoL.position.y = t > 20 ? M.HGT + 0.03 : 0.012; M.elecL.position.y = t > 20 ? M.HGT + 0.04 : 0.014;
    M.solCut.constant = -0.5 + (W + 1) * span(t, 10, 12.6);
    M.floor.visible = t > 10;
    // murs et fenêtres qui montent
    const rise = span(t, 13.3, 15.8);
    M.walls.scale.y = Math.max(0.0005, rise); M.walls.visible = rise > 0.001;
    M.ao.material.opacity = rise;
    // mobilier : du centre vers les bords
    M.furn.forEach((g) => { const a = 17.6 + (g.userData.d / M.dmax) * 2.4; const k = span(t, a, a + 0.7); g.scale.y = Math.max(0.0005, k); g.visible = k > 0.001; });
    // lumière
    // le jour (soleil haut, lumière neutre), puis la fin d'après-midi : soleil bas et chaud qui entre par les fenêtres
    const L = span(t, 21.5, 23.5);
    const az = -1.95 + 0.2 * L + 0.12 * span(t, 23.5, 31), el = 1.1 - 0.52 * L;
    M.sun.position.set(cx + Math.cos(az) * 16 * Math.cos(el), 16 * Math.sin(el), cz + Math.sin(az) * 16 * Math.cos(el));
    M.sun.intensity = 2.4 + 1.6 * L;
    M.sun.color.setRGB(1, 0.95 - 0.1 * L, 0.88 - 0.26 * L);
    M.hemi.intensity = 0.42 - 0.2 * L;
    const env = 0.5 - 0.24 * L; M.mats.forEach((m) => (m.envMapIntensity = env));
    M.lamps.forEach(({ g, glow }) => { g.visible = L > 0; glow.material.opacity = 0.42 * L; });
    // caméra : vue du dessus → perspective → tour lent → vue du dessus (plan complet) → perspective (résultat)
    const persp = span(t, 13, 16.5) - span(t, 25.6, 28.2) + span(t, 30.5, 33);
    const orbit = 0.55 * span(t, 16.5, 25.6) + 0.35 * span(t, 30.5, DUR);
    const fov = (camera.fov * Math.PI) / 180, asp = camera.aspect;
    const rTop = Math.max(H / 2 / Math.tan(fov / 2), W / 2 / (Math.tan(fov / 2) * asp)) * 1.06;
    const r = rTop + (Math.max(W, H) * (1.06 + 0.12 * span(t, 21.5, 24)) - rTop) * persp;
    // (à l'étape de la lumière, la caméra monte un peu pour voir le soleil sur les parquets)
    const phi = 0.0001 + (0.8 - 0.26 * span(t, 21.5, 24)) * persp, th = -0.42 + orbit;
    camera.up.set(0, 0, -1).lerp(new THREE.Vector3(0, 1, 0), persp).normalize();
    camera.position.set(cx + r * Math.sin(phi) * Math.sin(th), r * Math.cos(phi), cz + 0.35 * persp + r * Math.sin(phi) * Math.cos(th));
    camera.lookAt(cx, 0.6 * persp, cz + 0.35 * persp);
    renderer.render(scene, camera);
    // légende et photos
    let s = 0; STEPS.forEach(([, a], i) => { if (t >= a) s = i; });
    if (caption.dataset.s !== String(s)) { caption.dataset.s = s; caption.innerHTML = `<b>${String(s + 1).padStart(2, "0")} · ${STEPS[s][2]}</b> ${STEPS[s][3]}`; chips.forEach((c, i) => c.classList.toggle("is-on", i === s)); }
    const P = photos.length, pa = 31.2, per = (DUR - pa) / Math.max(1, P);
    // chaque photo se pose sur la précédente (la maquette ne transparaît pas entre deux photos)
    photos.forEach((p, i) => { p.style.opacity = String(clamp((t - pa - i * per) / 0.7)); });
  }

  // ───── lecture ─────
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  addEventListener("resize", () => { resize(); frame(T); });
  const tick = (now) => {
    if (!playing) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    T += dt; if (T >= DUR) { T = DUR; playing = false; replay.hidden = false; }
    frame(T); if (playing) requestAnimationFrame(tick);
  };
  const play = () => { if (playing || record) return; playing = true; replay.hidden = true; last = performance.now(); requestAnimationFrame(tick); };
  const pause = () => { playing = false; };
  const io = new IntersectionObserver((e) => e.forEach((x) => (x.isIntersecting && !reduce ? play() : pause())), { threshold: 0.35 });
  chips.forEach((c) => c.addEventListener("click", () => { T = STEPS[+c.dataset.i][1] + 0.01; frame(T); if (!reduce) play(); }));
  replay.addEventListener("click", () => { T = 0; frame(0); play(); });
  if (reduce) ready.then(() => { T = 28.5; frame(T); });
}
