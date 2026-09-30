#!/usr/bin/env node
/*
 * Récupère les photos de l'ancien site (www.embi.fr) dans photos-originales/,
 * rangées par chantier : photos-originales/projets/<id>/01.jpg, 02.jpg…
 * et photos-originales/site/<nom>.jpg (photo d'accueil, couvertures des catalogues).
 * À lancer AVANT la fermeture de l'ancien site :  cd scripts/photos && npm run telecharger
 * Les photos introuvables sont simplement ignorées.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "../..");
const { PROJECTS } = require(path.join(ROOT, "src/data/projects.js"));
const OLD = "https://www.embi.fr/wp-content/uploads/";
const SITE = {
  hero: "2018/08/FishClub-paris.jpg",
  "catalogue-azulev": "2017/09/azulev_pres-1.jpg",
  "catalogue-cifre": "2017/09/ciifre_pres-1.jpg",
  "catalogue-novaceram": "2017/09/Novaceram_pres.jpg",
  "catalogue-recer": "2017/09/recer.jpg",
  "catalogue-boxer": "2017/09/Boxer_pres.jpg",
};
const get = async (url, file) => {
  const r = await fetch(url);
  if (!r.ok) return false;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  return true;
};
(async () => {
  let ok = 0, ko = 0;
  for (const p of PROJECTS) {
    let n = 0;
    for (const f of p.images) {
      const file = path.join(ROOT, "photos-originales/projets", p.id, `${String(n + 1).padStart(2, "0")}${path.extname(f)}`);
      if (await get(OLD + f, file)) { n++; ok++; } else ko++;
    }
    console.log(`${p.id} : ${n} photo(s)`);
  }
  for (const [name, f] of Object.entries(SITE)) (await get(OLD + f, path.join(ROOT, "photos-originales/site", name + path.extname(f)))) ? ok++ : ko++;
  console.log(`Terminé : ${ok} photos récupérées, ${ko} adresses sans photo (ignorées).`);
})();
