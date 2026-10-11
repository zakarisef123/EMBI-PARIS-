#!/usr/bin/env node
/*
 * Vidéos des chantiers : une vidéo par chantier, uniquement avec ses propres photos, sans son.
 *   assets/video/projets/<chantier>-paysage.mp4  en-tête de la page chantier sur ordinateur (16:9)
 *   assets/video/projets/<chantier>-portrait.mp4 en-tête de la page chantier sur téléphone (9:16)
 *   assets/video/projets/<chantier>-carre.mp4    miniature du chantier dans les listes (1:1, recadrée par le site)
 *   assets/video/projets/videos.json             liste lue par scripts/build.js
 *
 * Usage (outil local, Netlify ne l'exécute pas) :
 *   cd scripts/videos && npm install && node generer.js            # tous les chantiers dont les photos sont sur le site
 *   node generer.js hotel-beauregard cafe-pinson                    # seulement ces chantiers
 * Il faut ffmpeg (variable FFMPEG si ce n'est pas « ffmpeg »).
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "../..");
const OUT = path.join(ROOT, "assets/video/projets");
const TMP = path.join(require("os").tmpdir(), "embi-videos");
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const { PROJECTS } = require(path.join(ROOT, "src/data/projects.js"));
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/img/manifest.json"), "utf8"));

// formats : taille, durée d'un plan (D) et du fondu (C), nombre de plans, qualité d'encodage
const FORMATS = {
  paysage: { W: 1600, H: 900, D: 3.4, C: 1.1, max: 4, crf: 28, fps: 30, gap: 8 },
  portrait: { W: 720, H: 1280, D: 3.4, C: 1.1, max: 4, crf: 28, fps: 30, gap: 8 },
  carre: { W: 600, H: 600, D: 2.4, C: 0.8, max: 4, crf: 30, fps: 25, gap: 6 },
};

const coverFirst = (list, n) => (!n || n < 1 || n > list.length ? list : [list[n - 1], ...list.slice(0, n - 1), ...list.slice(n)]);

async function photosOf(p) {
  const list = coverFirst(manifest.projets[p.id], p.cover);
  const out = [];
  for (const e of list) {
    const best = Math.max(...e.widths);
    const file = path.join(ROOT, `${e.base}-${best}.webp`.replace(/^\//, ""));
    if (!fs.existsSync(file)) continue;
    const m = await sharp(file).metadata(); // dimensions réelles du fichier (le manifeste peut être approximatif)
    out.push({ url: `http://video.local/${e.base.replace(/^\//, "")}-${best}.webp`, w: m.width, h: m.height, r: m.width / m.height });
  }
  return out;
}

// découpage en plans selon le format : photo seule quand son sens convient au cadre, sinon deux photos réunies
function planOf(fmt, photos) {
  const F = FORMATS[fmt];
  const frameR = F.W / F.H;
  const good = photos.filter((ph) => Math.max(ph.w, ph.h) >= 700);
  const pool = good.length >= 3 ? good : photos;
  const shots = [];
  if (fmt === "carre") {
    pool.slice(0, F.max).forEach((ph) => shots.push({ photos: [ph.url] }));
  } else {
    const fits = (ph) => (frameR > 1 ? ph.r >= 1.15 : ph.r <= 0.9);
    const rest = [...pool];
    while (rest.length && shots.length < F.max) {
      const ph = rest.shift();
      if (fits(ph) && Math.max(ph.w, ph.h) >= (frameR > 1 ? 950 : 950)) { shots.push({ photos: [ph.url] }); continue; }
      // à réunir avec la suivante du même sens (ou la suivante tout court)
      let j = rest.findIndex((x) => !fits(x));
      if (j < 0) j = 0;
      const mate = rest.splice(j, 1)[0];
      if (mate) shots.push({ photos: [ph.url, mate.url], split: frameR > 1 ? "h" : "v" });
      else shots.push({ photos: [ph.url] });
    }
  }
  return { W: F.W, H: F.H, D: F.D, C: F.C, fps: F.fps, gap: F.gap, shots: shots.map(({ photos, split }) => ({ photos, split })) };
}

async function renderJob(page, id, fmt, plan) {
  const dir = path.join(TMP, `${id}-${fmt}`);
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  await page.setViewportSize({ width: plan.W, height: plan.H });
  await page.goto("http://video.local/scripts/videos/lecteur.html");
  const r = await page.evaluate((pl) => window.setup(pl), plan);
  if (r.bad.length) throw new Error(`${id} ${fmt} : photos introuvables ${r.bad.join(", ")}`);
  const FPS = plan.fps, N = Math.round(plan.shots.length * plan.D * FPS);
  for (let f = 0; f < N; f++) {
    await page.evaluate((t) => window.renderAt(t), f / FPS);
    await page.screenshot({ path: path.join(dir, String(f).padStart(5, "0") + ".jpg"), type: "jpeg", quality: 93 });
  }
  const out = path.join(OUT, `${id}-${fmt}.mp4`);
  execFileSync(FFMPEG, ["-hide_banner", "-loglevel", "error", "-y", "-framerate", String(FPS), "-i", path.join(dir, "%05d.jpg"),
    "-c:v", "libx264", "-preset", "slower", "-crf", String(FORMATS[fmt].crf), "-profile:v", "high", "-level", "4.0", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart", "-an", out]);
  fs.rmSync(dir, { recursive: true, force: true });
  return { file: `/assets/video/projets/${id}-${fmt}.mp4`, duree: +(N / FPS).toFixed(2), plans: plan.shots.length, ko: Math.round(fs.statSync(out).size / 1024) };
}

(async () => {
  const only = process.argv.slice(2);
  const todo = PROJECTS.filter((p) => manifest.projets[p.id] && manifest.projets[p.id].length && (!only.length || only.includes(p.id)));
  fs.mkdirSync(OUT, { recursive: true });
  const listFile = path.join(OUT, "videos.json");
  const list = fs.existsSync(listFile) ? JSON.parse(fs.readFileSync(listFile, "utf8")) : {};
  const jobs = [];
  for (const p of todo) {
    const photos = await photosOf(p);
    if (photos.length < 2) { console.log(`· ${p.id} : moins de 2 photos, pas de vidéo`); continue; }
    for (const fmt of Object.keys(FORMATS)) jobs.push({ id: p.id, fmt, plan: planOf(fmt, photos) });
  }
  const b = await chromium.launch({ args: ["--force-color-profile=srgb"] });
  const WORKERS = Math.min(4, jobs.length);
  let next = 0;
  await Promise.all(Array.from({ length: WORKERS }, async () => {
    const page = await b.newPage();
    await page.route(/^http:\/\/video\.local\//, (r) => {
      const f = path.join(ROOT, decodeURIComponent(new URL(r.request().url()).pathname));
      return fs.existsSync(f) ? r.fulfill({ path: f }) : r.fulfill({ status: 404, body: "" });
    });
    while (next < jobs.length) {
      const j = jobs[next++];
      const res = await renderJob(page, j.id, j.fmt, j.plan);
      (list[j.id] = list[j.id] || {})[j.fmt] = res.file;
      console.log(`✓ ${j.id} · ${j.fmt} · ${res.plans} plans · ${res.duree} s · ${res.ko} ko`);
    }
  }));
  await b.close();
  fs.writeFileSync(listFile, JSON.stringify(Object.fromEntries(Object.entries(list).sort()), null, 2) + "\n");
  console.log(`${jobs.length} vidéos · liste : assets/video/projets/videos.json`);
})().catch((e) => { console.error(e); process.exit(1); });
