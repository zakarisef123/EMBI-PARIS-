#!/usr/bin/env node
/*
 * ─────────────────────────────────────────────────────────────
 *  GÉNÉRATION DU SITE  ·  node scripts/build.js
 *
 *  À relancer après avoir modifié assets/js/projects.js ou partials/.
 *  - insère l'en-tête et le pied de page communs (partials/) dans toutes les pages ;
 *  - crée une vraie page HTML par chantier : realisations/<id>.html ;
 *  - écrit la liste des réalisations directement dans realisations.html ;
 *  - ajoute l'adresse canonique de chaque page et génère sitemap.xml + robots.txt.
 *  Aucune dépendance : Node.js suffit.
 * ─────────────────────────────────────────────────────────────
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const SITE = "https://www.embi.fr/"; // adresse définitive du site (sert aux liens canoniques et au sitemap)
const ROOT = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const write = (f, s) => fs.writeFileSync(path.join(ROOT, f), s);
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const fill = (tpl, data) => tpl.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in data ? data[k] : m));
const today = new Date().toISOString().slice(0, 10);

/* ───── Données des chantiers (projects.js évalué comme dans le navigateur) ───── */
const load = (root) => {
  const ctx = { window: { EMBI_ROOT: root } };
  vm.createContext(ctx);
  vm.runInContext(read("assets/js/projects.js"), ctx);
  return ctx.window;
};
const W0 = load(""), W1 = load("../");
const cats = W0.EMBI_CATEGORIES;
const LEAD = { hotel: "Hôtel rénové", boutique: "Boutique rénovée", restaurant: "Restaurant rénové", particulier: "Appartement rénové" };
const PLURAL = { hotel: "hôtels", boutique: "boutiques", restaurant: "restaurants", particulier: "appartements" };

/* ───── En-tête et pied de page communs ───── */
const NAV = [
  { key: "realisations", href: "realisations.html", label: "Réalisations", mega: true },
  { key: "conception", href: "conception.html", label: "Sur mesure" },
  { key: "savoir-faire", href: "savoir-faire.html", label: "Savoir-faire" },
  { key: "methode", href: "methode.html", label: "Méthode" },
  { key: "showroom", href: "showroom.html", label: "Showroom" },
];
const header = (page, root) =>
  fill(read("partials/header.html"), {
    root,
    nav: [
      ...NAV.map((n) => `        <a href="${root}${n.href}"${n.mega ? " data-mega" : ""}${n.key === page ? ' aria-current="page"' : ""}>${n.label}</a>`),
      `        <a href="${root}contact.html" class="nav__cta"${page === "contact" ? ' aria-current="page"' : ""}>Devis gratuit</a>`,
    ].join("\n"),
  }).trim();
const footer = (root) => fill(read("partials/footer.html"), { root, year: new Date().getFullYear() }).trim();

const inject = (html, name, content) =>
  html.replace(new RegExp(`(<!-- @${name} -->)[\\s\\S]*?(<!-- @/${name} -->)`), `$1\n  ${content}\n  $2`);
const seo = (url) => `<link rel="canonical" href="${url}" />\n  <meta property="og:url" content="${url}" />\n  <meta property="og:site_name" content="EMBI" />\n  <meta property="og:locale" content="fr_FR" />`;
const injectSeo = (html, url) => html.replace(/<!-- @seo -->(?:[\s\S]*?<!-- @\/seo -->)?/, `<!-- @seo -->\n  ${seo(url)}\n  <!-- @/seo -->`);

/* ───── Liste des réalisations (même rendu que main.js) ───── */
const refsList = (projects) =>
  projects
    .map((p, i) => {
      const txt = p.text || `${LEAD[p.category] || "Lieu rénové"} clé en main par EMBI, de l'étude de faisabilité à la livraison.`;
      const href = W0.EMBI_PROJECT_URL(p.id);
      return `<li class="acc__item">
          <button class="acc__head" type="button" aria-expanded="false" aria-controls="acc-${i}" data-i="${i}">
            <span class="acc__n">${String(i + 1).padStart(2, "0")}</span><span class="acc__t">${esc(p.title)}</span><span class="acc__c">${esc(cats[p.category] || "")}</span><span class="acc__ar" aria-hidden="true">→</span>
          </button>
          <div class="acc__panel" id="acc-${i}" role="region"><div class="acc__inner">
            <a class="acc__img" href="${href}" tabindex="-1"><img src="${esc(p.images[0])}" alt="${esc(p.title)}, rénové par EMBI" loading="lazy" /></a>
            <div class="acc__body"><p>${esc(txt)}</p><a class="btn btn--accent acc__open" href="${href}">Voir le projet ${esc(p.title)} <span aria-hidden="true">→</span></a></div>
          </div></div>
        </li>`;
    })
    .join("\n        ");

/* ───── Pages des chantiers ───── */
const projects = W1.EMBI_PROJECTS;
const tpl = read("partials/projet.html");
const outDir = path.join(ROOT, "realisations");
fs.mkdirSync(outDir, { recursive: true });
fs.readdirSync(outDir).filter((f) => f.endsWith(".html")).forEach((f) => fs.unlinkSync(path.join(outDir, f)));

const card = (q) => `<a class="pj-card" href="${q.id}.html">
          <span class="pj-card__media"><img src="${esc(q.images[0])}" alt="${esc(q.title)}" loading="lazy" /></span>
          <span class="pj-card__info"><strong>${esc(q.title)}</strong><em>${esc(cats[q.category] || "")}</em></span>
        </a>`;
const abs = (u) => (/^https?:/.test(u) ? u : SITE + u.replace(/^(\.\.\/)+/, ""));

projects.forEach((p, i) => {
  const cat = cats[p.category] || "";
  const lead = p.text || `${LEAD[p.category] || "Lieu rénové"} clé en main par EMBI, de l'étude de faisabilité à la livraison.`;
  const description = p.text
    ? `${p.title} (${cat.toLowerCase()}, Paris) : ${p.text} Rénovation clé en main par EMBI, photos et détails du chantier.`
    : `${p.title} : ${(LEAD[p.category] || "lieu rénové").toLowerCase()} clé en main par EMBI à Paris. Photos et détails du chantier.`;
  const facts = [["Catégorie", cat], ["Lieu", p.lieu], ["Année", p.annee], ["Surface", p.surface], ["Durée", p.duree], ["Décoration", p.deco], ["Architecte", p.archi], ["Prestation", "Clé en main"]].filter(([, v]) => v);
  const story = p.histoire && p.histoire.length ? p.histoire : [
    "Comme pour chaque chantier EMBI, ce projet a été mené de A à Z : étude de faisabilité, chiffrage transparent poste par poste, puis coordination de tous les corps de métier jusqu'à la livraison.",
    "Un interlocuteur unique a suivi le chantier du premier rendez-vous à la remise des clés, avec le souci du détail et le respect des délais qui font la réputation d'EMBI.",
  ];
  const prev = projects[(i - 1 + projects.length) % projects.length], next = projects[(i + 1) % projects.length];
  const same = projects.filter((q) => q.category === p.category && q.id !== p.id);
  const more = same.concat(projects.filter((q) => q.category !== p.category && q.id !== p.id)).slice(0, 3);
  const url = `${SITE}realisations/${p.id}.html`;
  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: SITE },
        { "@type": "ListItem", position: 2, name: "Réalisations", item: `${SITE}realisations.html` },
        { "@type": "ListItem", position: 3, name: p.title, item: url },
      ] },
      { "@type": "CreativeWork", name: `${p.title} : ${(LEAD[p.category] || "rénovation").toLowerCase()} par EMBI`, url, image: p.images.slice(0, 6).map(abs), about: cat, creator: { "@type": "GeneralContractor", name: "EMBI", url: SITE } },
    ],
  };
  const html = fill(tpl, {
    id: p.id,
    category: p.category,
    title: esc(p.title),
    pageTitle: esc(`${p.title} · ${cat} rénové à Paris | EMBI`),
    description: esc(description),
    ogImage: esc(abs(p.images[0])),
    jsonld: JSON.stringify(jsonld),
    cover: esc(p.images[0]),
    coverAlt: esc(`${p.title}, ${cat.toLowerCase()} rénové par EMBI`),
    catLine: `<span>${esc(cat)}</span>${p.lieu ? ` · ${esc(p.lieu)}` : ""}${p.annee ? ` · ${esc(p.annee)}` : ""}`,
    lead: esc(lead),
    facts: `<p class="pj-facts__title">Le projet en bref</p><dl>${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`,
    storyTitle: esc(`${LEAD[p.category] || "Lieu rénové"} clé en main à Paris`),
    story: story.map((t) => `<p>${esc(t)}</p>`).join(""),
    works: p.travaux && p.travaux.length ? `<ul class="pj-works" id="pjWorks">${p.travaux.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : "",
    count: p.images.length > 1 ? `${p.images.length} photos · cliquez pour agrandir` : "Cliquez sur la photo pour l'agrandir",
    singleClass: p.images.length === 1 ? " is-single" : "",
    gallery: p.images.map((src, k) => `<button type="button" class="pj-shot" data-k="${k}" aria-label="Agrandir la photo ${k + 1}"><img src="${esc(src)}" alt="${esc(p.title)}, photo ${k + 1}" loading="${k < 4 ? "eager" : "lazy"}" /></button>`).join(""),
    prevNext: `<a class="pj-nav__link pj-nav__link--prev" href="${prev.id}.html"><span>← Chantier précédent</span><strong>${esc(prev.title)}</strong></a><a class="pj-nav__link pj-nav__link--next" href="${next.id}.html"><span>Chantier suivant →</span><strong>${esc(next.title)}</strong></a>`,
    moreTitle: same.length ? `Autres <em>${esc(PLURAL[p.category] || "réalisations")}.</em>` : "Autres <em>réalisations.</em>",
    more: more.map(card).join(""),
  });
  let out = inject(html, "header", header("realisations", "../"));
  out = inject(out, "footer", footer("../"));
  out = injectSeo(out, url);
  write(`realisations/${p.id}.html`, out);
});

/* ───── Pages principales : en-tête, pied de page, canonique ───── */
const PAGES = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"));
const indexable = [];
PAGES.forEach((f) => {
  let html = read(f);
  const page = (html.match(/<body[^>]*data-page="([^"]+)"/) || [])[1];
  if (!page) return;
  html = inject(html, "header", header(page, ""));
  html = inject(html, "footer", footer(""));
  if (html.includes("<!-- @refs -->")) html = inject(html, "refs", refsList(W0.EMBI_PROJECTS));
  const noindex = /<meta name="robots" content="noindex/.test(html);
  const url = f === "index.html" ? SITE : SITE + f;
  if (!noindex) { html = injectSeo(html, url); indexable.push(url); }
  write(f, html);
});

/* ───── Plan du site + robots.txt ───── */
const urls = [...indexable.sort((a, b) => (a === SITE ? -1 : b === SITE ? 1 : a.localeCompare(b))), ...projects.map((p) => `${SITE}realisations/${p.id}.html`)];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);
write("robots.txt", `User-agent: *
Allow: /

Sitemap: ${SITE}sitemap.xml
`);
console.log(`✓ ${indexable.length} pages mises à jour, ${projects.length} pages de chantier générées, sitemap.xml (${urls.length} adresses).`);
