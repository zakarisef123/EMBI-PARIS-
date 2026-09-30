#!/usr/bin/env node
/*
 * Convertit les photos originales en WebP, en plusieurs tailles (pour srcset) :
 *   photos-originales/projets/<id>/*.jpg|png  →  assets/img/projets/<id>/01-480.webp, 01-960.webp, 01-1600.webp…
 *   photos-originales/site/<nom>.jpg          →  assets/img/site/<nom>-480.webp…
 * et écrit assets/img/manifest.json (lu par scripts/build.js).
 *
 * Mettez les photos haute définition d'un chantier dans photos-originales/projets/<id>/,
 * nommées dans l'ordre d'affichage (01.jpg = couverture). Puis :
 *   cd scripts/photos && npm install && npm run convertir
 * et passez  photos: "local"  dans site.config.js.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const ROOT = path.join(__dirname, "../..");
const IN = path.join(ROOT, "photos-originales");
const OUT = path.join(ROOT, "assets/img");
const WIDTHS = [480, 960, 1600];
const IMG = /\.(jpe?g|png|webp|tiff?)$/i;

const convert = async (file, outBase) => {
  const meta = await sharp(file).rotate().metadata();
  const ratio = meta.height / meta.width;
  const widths = WIDTHS.filter((w) => w <= meta.width);
  if (!widths.length) widths.push(meta.width);
  fs.mkdirSync(path.dirname(outBase), { recursive: true });
  for (const w of widths) await sharp(file).rotate().resize({ width: w }).webp({ quality: 78 }).toFile(`${outBase}-${w}.webp`);
  const w = widths[Math.min(1, widths.length - 1)];
  return { base: "/" + path.relative(ROOT, outBase).split(path.sep).join("/"), widths, w, h: Math.round(w * ratio) };
};

(async () => {
  if (!fs.existsSync(IN)) return console.log("Aucun dossier photos-originales/ : rien à convertir.");
  const manifest = { projets: {}, site: {} };
  const dir = path.join(IN, "projets");
  if (fs.existsSync(dir))
    for (const id of fs.readdirSync(dir).filter((d) => fs.statSync(path.join(dir, d)).isDirectory())) {
      const files = fs.readdirSync(path.join(dir, id)).filter((f) => IMG.test(f)).sort();
      fs.rmSync(path.join(OUT, "projets", id), { recursive: true, force: true });
      manifest.projets[id] = [];
      for (const [k, f] of files.entries()) manifest.projets[id].push(await convert(path.join(dir, id, f), path.join(OUT, "projets", id, String(k + 1).padStart(2, "0"))));
      console.log(`${id} : ${files.length} photo(s)`);
    }
  const sdir = path.join(IN, "site");
  if (fs.existsSync(sdir))
    for (const f of fs.readdirSync(sdir).filter((f) => IMG.test(f))) {
      const name = path.parse(f).name;
      manifest.site[name] = await convert(path.join(sdir, f), path.join(OUT, "site", name));
      console.log(`site/${name}`);
    }
  fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log("Terminé : assets/img/manifest.json mis à jour. Passez photos: \"local\" dans site.config.js.");
})();
