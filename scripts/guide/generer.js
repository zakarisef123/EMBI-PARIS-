#!/usr/bin/env node
/*
 * Guide « 10 questions à se poser avant de rénover à Paris » : scripts/guide/guide.html → documents/guide-renovation-paris.pdf
 * Proposé contre un e-mail (encart du site, assets/js/cta.js). Après une modification du texte :
 *   node scripts/guide/generer.js        (utilise le Chromium de scripts/videos : cd scripts/videos && npm install au besoin)
 */
const path = require("path");
const { chromium } = require(path.join(__dirname, "../videos/node_modules/playwright"));
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto("file://" + path.join(__dirname, "guide.html"), { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  const out = path.join(__dirname, "../../documents/guide-renovation-paris.pdf");
  await p.pdf({ path: out, printBackground: true, preferCSSPageSize: true });
  await b.close();
  console.log("Guide écrit :", path.relative(process.cwd(), out));
})();
