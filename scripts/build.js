#!/usr/bin/env node
/*
 * ─────────────────────────────────────────────────────────────
 *  GÉNÉRATION DU SITE EMBI  ·  node scripts/build.js
 *
 *  Lit src/ (pages, gabarits, données) et site.config.js,
 *  puis écrit le site complet dans dist/ (publié par Netlify).
 *  Aucune dépendance : Node.js 18+ suffit.
 *
 *  - en-tête et pied de page communs (src/layout/) sur toutes les pages ;
 *  - adresses propres : chaque page devient <dossier>/index.html ;
 *  - pages secteur, grille et pages chantier générées depuis src/data/ ;
 *  - titres, descriptions, Open Graph, JSON-LD, sitemap.xml, robots.txt,
 *    redirections des anciennes adresses (_redirects) ;
 *  - contrôles : un seul H1 par page, un texte alt sur chaque image,
 *    titres et descriptions uniques, liens internes existants.
 * ─────────────────────────────────────────────────────────────
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "dist");
const cfg = require(path.join(ROOT, "site.config.js"));
const { CATEGORIES, PROJECTS } = require(path.join(ROOT, "src/data/projects.js"));
const SECTORS = require(path.join(ROOT, "src/data/sectors.js"));

const SITE = cfg.siteUrl.replace(/\/$/, "");
const OLD = "https://www.embi.fr/wp-content/uploads/";
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const strip = (s = "") => String(s).replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const fill = (tpl, data) => tpl.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in data ? data[k] : m));
const warnings = [];
const warn = (m) => warnings.push(m);

/* ───── Photos : ancien site ou WebP locaux (site.config.js → photos) ───── */
const manifestFile = path.join(ROOT, "assets/img/manifest.json");
const manifest = cfg.photos === "local" && fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, "utf8")) : null;
if (cfg.photos === "local" && !manifest) warn("photos: \"local\" mais assets/img/manifest.json est absent : photos de l'ancien site utilisées.");
const localSet = (e) => ({ src: `${e.base}-${e.widths[Math.min(1, e.widths.length - 1)]}.webp`, srcset: e.widths.map((w) => `${e.base}-${w}.webp ${w}w`).join(", "), width: e.w, height: e.h });
const projectPhotos = (p) => {
  const list = manifest && manifest.projets && manifest.projets[p.id];
  if (list && list.length) return list.map(localSet);
  if (manifest) warn(`photos locales absentes pour « ${p.id} » : photos de l'ancien site utilisées.`);
  return p.images.map((f) => ({ src: OLD + f }));
};
// images du site hors chantiers (photo d'accueil, couvertures des catalogues)
const SITE_IMAGES = {
  hero: "2018/08/FishClub-paris.jpg",
  "catalogue-azulev": "2017/09/azulev_pres-1.jpg",
  "catalogue-cifre": "2017/09/ciifre_pres-1.jpg",
  "catalogue-novaceram": "2017/09/Novaceram_pres.jpg",
  "catalogue-recer": "2017/09/recer.jpg",
  "catalogue-boxer": "2017/09/Boxer_pres.jpg",
};
const sitePhoto = (name) => {
  const e = manifest && manifest.site && manifest.site[name];
  return e ? localSet(e) : { src: OLD + SITE_IMAGES[name] };
};
const img = (ph, alt, extra = "") =>
  `<img src="${esc(ph.src)}"${ph.srcset ? ` srcset="${ph.srcset}" sizes="${extra.includes("data-hero") ? "100vw" : "(max-width: 760px) 100vw, 50vw"}"` : ""}${ph.width ? ` width="${ph.width}" height="${ph.height}"` : ""} alt="${esc(alt)}"${extra ? " " + extra.replace("data-hero", "").trim() : ""} />`;

/* ───── Documents PDF : ancien site ou dossier documents/ (site.config.js → documents) ───── */
const DOCS = {
  cgv: { file: "EMBI-CGV.pdf", old: "2017/09/EMBI-CGV.pdf" },
  azulev: { file: "catalogues/Azulev_catalogue_2015-2016.pdf", old: "2017/09/Azulev_catalogue_2015-2016.pdf" },
  cifre: { file: "catalogues/CIFRE_catalogue.pdf", old: "2017/09/CIFRE_catalogue.pdf" },
  novaceram: { file: "catalogues/Novaceram_catalogue_2015.pdf", old: "2017/09/Novaceram_catalogue_2015.pdf" },
  recer: { file: "catalogues/RECER_catalogue.pdf", old: "2017/09/RECER_catalogue.pdf" },
};
const doc = (k) => {
  const d = DOCS[k];
  if (cfg.documents !== "local") return OLD + d.old;
  if (!fs.existsSync(path.join(ROOT, "documents", d.file))) warn(`documents: "local" mais documents/${d.file} est absent.`);
  return `/documents/${d.file}`;
};

/* ───── Données communes ───── */
const LEAD = { hotel: "Hôtel rénové", boutique: "Boutique rénovée", restaurant: "Restaurant rénové", particulier: "Appartement rénové" };
const PLURAL = { hotel: "hôtels", boutique: "boutiques", restaurant: "restaurants", particulier: "appartements" };
const sectorOf = (cat) => SECTORS.find((s) => s.category === cat);
const projectUrl = (p) => `/realisations/${p.id}/`;
const featured = PROJECTS.filter((p) => p.featured).sort((a, b) => a.featured - b.featured);
const PHOTOS = Object.fromEntries(PROJECTS.map((p) => [p.id, projectPhotos(p)]));
const cover = (p) => PHOTOS[p.id][0];
const abs = (u) => (/^https?:/.test(u) ? u : SITE + u);

const BUSINESS = {
  "@type": "GeneralContractor",
  "@id": `${SITE}/#entreprise`,
  name: "EMBI",
  description: "Rénovation clé en main à Paris : hôtels, boutiques, restaurants et appartements.",
  url: `${SITE}/`,
  logo: `${SITE}/assets/img/apple-touch-icon.png`,
  image: abs(sitePhoto("hero").src),
  email: "sec@embi.fr",
  telephone: "+33145726524",
  address: { "@type": "PostalAddress", streetAddress: "5 rue Villebois-Mareuil", postalCode: "75017", addressLocality: "Paris", addressCountry: "FR" },
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "10:00", closes: "18:00" }],
  areaServed: "Paris et Île-de-France",
  contactPoint: [
    { "@type": "ContactPoint", telephone: "+33145726524", contactType: "customer service", availableLanguage: "French" },
    { "@type": "ContactPoint", telephone: "+33631600135", contactType: "emergency", availableLanguage: "French" },
  ],
  sameAs: Object.values(cfg.social).filter(Boolean),
};

/* ───── Gabarit de page ───── */
const NAV = [
  { key: "renovation", href: "/renovation/", label: "Rénovation", menu: [["/renovation/interieur/", "Rénovation intérieure"], ["/renovation/energetique/", "Rénovation énergétique RGE"], ["/renovation/exterieur/", "Rénovation extérieure"], ["/conception-sur-mesure/", "Conception sur mesure"], ["/showroom/", "Showroom carrelages & parquets"]] },
  { key: "signature", href: "/signature/", label: "Signature" },
  { key: "realisations", href: "/realisations/", label: "Réalisations", mega: true },
  { key: "equipe", href: "/equipe/", label: "L'équipe" },
  { key: "mag", href: "/mag/", label: "Le Mag" },
];
const HEADER = read("src/layout/header.html"), FOOTER = read("src/layout/footer.html"), LOADER = read("src/layout/loader.html");
const header = (key) =>
  fill(HEADER, {
    nav: [
      ...NAV.map((n) => n.menu
        ? `        <div class="dd"><a href="${n.href}" class="dd__t"${n.key === key ? ' aria-current="page"' : ""}>${n.label} <span aria-hidden="true">▾</span></a><div class="dd__menu">${n.menu.map(([h, l]) => `<a href="${h}">${l}</a>`).join("")}</div></div>`
        : `        <a href="${n.href}"${n.mega ? " data-mega" : ""}${n.key === key ? ' aria-current="page"' : ""}>${n.label}</a>`),
      `        <a href="/contact/" class="nav__cta"${key === "contact" ? ' aria-current="page"' : ""}>Devis gratuit</a>`,
    ].join("\n"),
    urgentCurrent: key === "urgence" ? ' aria-current="page"' : "",
  }).trim();
const SOCIAL_LABELS = { instagram: "Instagram", linkedin: "LinkedIn", facebook: "Facebook" };
const social = Object.entries(cfg.social).filter(([, u]) => u);
const footer = () =>
  fill(FOOTER, {
    year: new Date().getFullYear(),
    social: social.length ? `          <p class="footer__social">${social.map(([k, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${SOCIAL_LABELS[k]}</a>`).join(" · ")}</p>` : "",
  }).trim();

const LIGHTBOX = `
  <div class="lb" id="lb" hidden>
    <button class="lb__close" id="lbClose" type="button" aria-label="Fermer">✕</button>
    <button class="lb__nav lb__nav--prev" id="lbPrev" type="button" aria-label="Photo précédente">←</button>
    <img id="lbImg" alt="" />
    <button class="lb__nav lb__nav--next" id="lbNext" type="button" aria-label="Photo suivante">→</button>
    <p class="lb__count" id="lbCount"></p>
  </div>`;

const pages = []; // { path, html, title, description, noindex }
const layout = (o) => {
  const url = SITE + o.path;
  const og = abs(o.ogImage || sitePhoto("hero").src);
  const graph = [BUSINESS];
  if (o.crumbs) graph.push({ "@type": "BreadcrumbList", itemListElement: [{ name: "Accueil", path: "/" }, ...o.crumbs].map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: SITE + c.path })) });
  if (o.jsonld) graph.push(...o.jsonld);
  const scripts = ["projects", "menu", ...(o.scripts || ["main"]), "funnel", "cta"];
  const html = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(o.title)}</title>
  <meta name="description" content="${esc(o.description)}" />
${o.noindex ? '  <meta name="robots" content="noindex" />\n' : `  <link rel="canonical" href="${url}" />\n`}  <meta property="og:site_name" content="EMBI" />
  <meta property="og:locale" content="fr_FR" />
  <meta property="og:type" content="${o.ogType || "website"}" />
  <meta property="og:title" content="${esc(o.ogTitle || o.title)}" />
  <meta property="og:description" content="${esc(o.description)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${esc(og)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="theme-color" content="#0F0E0D" />
  <script>document.documentElement.classList.add("js");${o.loader ? ` try { if (!matchMedia("(prefers-reduced-motion: reduce)").matches && !sessionStorage.getItem("embi-intro")) { document.documentElement.classList.add("intro"); sessionStorage.setItem("embi-intro", "1"); } } catch (e) {}` : ""}</script>
  <script src="/assets/js/consent.js"></script>
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="/assets/img/favicon-32.png" sizes="32x32" type="image/png" />
  <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png" />
  <link rel="preload" href="/assets/fonts/cormorant-garamond-500-latin.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/assets/fonts/jost-400-latin.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="/assets/css/fonts.css" />
  <link rel="stylesheet" href="/assets/css/style.css" />
${cfg.photos !== "local" ? '  <link rel="preconnect" href="https://www.embi.fr" />\n' : ""}${o.preload || o.key === "accueil" ? `  <link rel="preload" as="image" href="${esc(o.preload || sitePhoto("hero").src)}" fetchpriority="high" />\n` : ""}  <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>
</head>
<body${o.bodyClass ? ` class="${o.bodyClass}"` : ""} data-page="${o.key}"${o.bodyAttrs || ""}>
  <a class="skip" href="#main">Aller au contenu</a>
${o.loader ? LOADER : ""}  <div class="progress" id="progress" aria-hidden="true"></div>
${scripts.includes("main") ? '  <div class="cursor" id="cursor" aria-hidden="true"><span id="cursorLabel"></span></div>\n' : ""}

  ${header(o.key)}

  <main id="main">
${o.content.trim()}
  </main>

  ${footer()}
${o.lightbox ? LIGHTBOX + "\n" : ""}
${scripts.map((s) => `  <script src="/assets/js/${s}.js"></script>`).join("\n")}
</body>
</html>
`;
  pages.push({ path: o.path, html, title: o.title, description: o.description, noindex: o.noindex });
};

/* ───── Blocs réutilisables ───── */
const pageHero = (crumbs, h1, lead, actions = "", readme = false) => `    <section class="cs-hero page-hero" id="pageHero">
      <div class="container page-hero__inner">
        <nav class="pj-crumbs" aria-label="Fil d'Ariane"><a href="/">Accueil</a>${crumbs.map((c, i) => `<span aria-hidden="true">/</span>${i < crumbs.length - 1 ? `<a href="${c.path}">${c.name}</a>` : `<span>${c.name}</span>`}`).join("")}</nav>
        <h1 class="cs-hero__title">${h1}</h1>
        ${readme ? "<!-- À RELIRE -->\n        " : ""}<p class="cs-hero__lead">${lead}</p>
        ${actions ? `<div class="cs-hero__actions">${actions}</div>` : ""}
      </div>
    </section>`;
const card = (p, level = "h3") => `<a class="pj-card" href="${projectUrl(p)}" data-cat="${p.category}">
            <span class="pj-card__media">${img(cover(p), `${p.title}, ${(LEAD[p.category] || "lieu rénové").toLowerCase()} par EMBI`, 'loading="lazy"')}</span>
            <span class="pj-card__info"><${level} class="pj-card__t">${esc(p.title)}</${level}><em>${esc(CATEGORIES[p.category] || "")}</em></span>
          </a>`;
// Tunnel de conversion, en bas de chaque page : 3 questions, puis les coordonnées, envoi direct (sans changer de page).
// cat : le lieu déjà connu (page secteur ou chantier) est pré-coché, le visiteur commence à la question 2.
const QUIZ_Q = [
  ["lieu", "Quel lieu voulez-vous transformer&nbsp;?", [["Appartement", "particulier"], ["Maison", "particulier"], ["Hôtel", "hotel"], ["Boutique", "boutique"], ["Restaurant", "restaurant"], ["Bureaux", ""]]],
  ["surface", "Quelle surface environ&nbsp;?", [["Moins de 30 m²"], ["30 à 80 m²"], ["80 à 150 m²"], ["Plus de 150 m²"]]],
  ["delai", "Pour quand&nbsp;?", [["Dès que possible"], ["D'ici 3 mois"], ["D'ici 6 mois ou plus"], ["Je me renseigne"]]],
];
const funnel = (cat = "") => `    <section class="funnel" id="projet"${cat && cat !== "particulier" ? ` data-preset="${cat}"` : ""}>
      <div class="funnel__wrap">
        <div class="funnel__intro">
          <p class="funnel__kicker">Devis gratuit</p>
          <h2 class="funnel__title">Votre projet en 3 questions</h2>
          <p class="funnel__lead">Quelques clics pour nous décrire votre projet : votre demande de devis gratuit est prête en moins d'une minute.</p>
          <ol class="funnel__next">
            <li><b>1</b><span>Vous décrivez votre projet</span></li>
            <li><b>2</b><span>Votre interlocuteur dédié vous recontacte</span></li>
            <li><b>3</b><span>Étude de faisabilité et devis gratuit, poste par poste</span></li>
          </ol>
          <p class="funnel__tel">Vous préférez en parler&nbsp;? <a href="tel:+33145726524">01 45 72 65 24</a></p>
        </div>
        <form class="quiz__card" id="quiz" name="questionnaire" method="POST" action="{{form:action}}">
          <input type="hidden" name="_subject" value="Votre projet en 3 questions (site EMBI)" />
          <input type="hidden" name="_next" value="{{site}}/merci/" />
          <input type="hidden" name="_template" value="table" />
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="page" value="" id="quizPage" />
          <p class="form__hp" hidden><label>Ne pas remplir ce champ : <input type="text" name="_honey" tabindex="-1" autocomplete="off" /></label></p>
          <div class="quiz__top">
            <span class="quiz__step" id="quizStep" aria-live="polite">Question 1 / 3</span>
            <button class="quiz__back" id="quizBack" type="button" hidden>← Retour</button>
          </div>
          <div class="quiz__bar"><span id="quizBar"></span></div>
          <div class="quiz__body" id="quizBody">
            ${QUIZ_Q.map(([name, q, opts], k) => `<fieldset class="quiz__set" data-step="${k}">
              <legend class="quiz__q">${q}</legend>
              <div class="quiz__opts">
                ${opts.map(([v, c]) => `<label class="quiz__opt"><input type="radio" name="${name}" value="${v}"${c ? ` data-cat="${c}"` : ""} required /><span>${v}</span><i aria-hidden="true">→</i></label>`).join("\n                ")}
              </div>
            </fieldset>`).join("\n            ")}
            <fieldset class="quiz__set quiz__final" data-step="3">
              <legend class="quiz__q">Vos coordonnées</legend>
              <ul class="quiz__recap" id="quizRecap"></ul>
              <p class="quiz__refs" id="quizRefs" hidden></p>
              <div class="form__row">
                <label class="field field--light"><span>Votre nom</span><input name="nom" required autocomplete="name" /></label>
                <label class="field field--light"><span>Votre téléphone</span><input name="telephone" type="tel" autocomplete="tel" /></label>
              </div>
              <label class="field field--light"><span>Votre e-mail</span><input name="email" type="email" required autocomplete="email" /></label>
              <label class="consent" for="consentQuiz"><input type="checkbox" id="consentQuiz" name="consentement" value="Accepté" required /><span>J'accepte qu'EMBI utilise ces informations pour répondre à ma demande, conformément à la <a href="/politique-de-confidentialite/">politique de confidentialité</a>.</span></label>
              <div class="quiz__end">
                <button type="submit" class="btn btn--accent">Recevoir mon devis gratuit <span aria-hidden="true">→</span></button>
                <button type="button" class="quiz__restart" id="quizRestart" hidden>Recommencer</button>
              </div>
              <p class="form__note" id="quizNote" role="status"></p>
            </fieldset>
          </div>
        </form>
      </div>
    </section>`;
const STEPS = [
  ["Étude de faisabilité", "Nous analysons l'ensemble de votre projet pour valider la faisabilité des travaux."],
  ["Chiffrage", "Un devis réalisé ensemble et en toute transparence, poste par poste."],
  ["Mise en place", "Nous signons ensemble les termes du chantier, puis nous installons et protégeons les lieux."],
  ["Réalisation", "Nos équipes spécialisées interviennent, coordonnées par votre interlocuteur dédié."],
  ["Livraison", "Un expert EMBI vous présente l'intégralité des travaux."],
];
const methodBrief = (level = "h3") => `<ol class="brief">
          ${STEPS.map(([t, d], i) => `<li class="brief__step reveal"><span class="brief__n">${String(i + 1).padStart(2, "0")}</span><${level} class="brief__t">${t}</${level}><p>${d}</p></li>`).join("\n          ")}
        </ol>`;
const sectorCards = () => `<div class="explore__grid">
          ${SECTORS.map((s, i) => {
            const n = PROJECTS.filter((p) => p.category === s.category).length;
            return `<a class="explore__card reveal" href="${s.path}"><span class="explore__n">${String(i + 1).padStart(2, "0")} · ${n} chantier${n > 1 ? "s" : ""}</span><h3 class="explore__t">${s.nav}</h3><p>${s.card}</p><span class="explore__go">Rénovation ${s.category === "particulier" ? "d'appartements" : `de ${PLURAL[s.category]}`} <i aria-hidden="true">→</i></span></a>`;
          }).join("\n          ")}
        </div>`;

// Accueil · diaporama du haut de page : la photo d'accueil puis les couvertures de ces chantiers
const HERO_SLIDES = ["hotel-panache", "loro-piana", "byredo"];
const heroSlides = () => {
  const slides = [
    { ph: sitePhoto("hero"), alt: "Salle du restaurant Fish Club à Paris, rénové par EMBI", label: "Fish Club · Restaurant" },
    ...HERO_SLIDES.map((id) => PROJECTS.find((p) => p.id === id)).filter(Boolean).map((p) => ({
      ph: PHOTOS[p.id][0], alt: `${p.title}, ${LEAD[p.category].toLowerCase()} par EMBI`, label: `${p.title} · ${CATEGORIES_LABEL[p.category]}`,
    })),
  ];
  return `<div class="hero__photo" id="heroSlides">
        ${slides.map((s, i) => `<figure class="hero__slide${i ? "" : " is-active"}" data-label="${esc(s.label)}">${img(s.ph, s.alt, i ? 'loading="lazy" data-hero' : 'fetchpriority="high" data-hero')}</figure>`).join("\n        ")}
      </div>`;
};
const CATEGORIES_LABEL = { hotel: "Hôtel", boutique: "Boutique", restaurant: "Restaurant", particulier: "Particulier" };

// Accueil · les 4 secteurs en mosaïque de photos (couverture du chantier le plus mis en avant de chaque secteur)
const sectorMosaic = () => `<div class="mosaic container">
          ${SECTORS.map((s, i) => {
            const list = PROJECTS.filter((p) => p.category === s.category);
            const cover = [...list].sort((a, b) => (a.featured || 99) - (b.featured || 99))[0];
            const n = list.length;
            return `<a class="mosaic__item mosaic__item--${i + 1} reveal" href="${s.path}">
            <figure class="mosaic__img">${img(PHOTOS[cover.id][0], `${cover.title}, ${LEAD[cover.category].toLowerCase()} par EMBI`, 'loading="lazy"')}<figcaption>${esc(cover.title)}</figcaption></figure>
            <span class="mosaic__n">${String(i + 1).padStart(2, "0")} · ${n} chantier${n > 1 ? "s" : ""}</span>
            <h3 class="mosaic__t">${s.nav}</h3>
            <p>${s.card}</p>
          </a>`;
          }).join("\n          ")}
        </div>`;

// Accueil · « Ils nous ont fait confiance » : un logo par client (hors particuliers).
// Déposez assets/img/logos/<id du chantier>.svg (ou .png) : il remplace le nom écrit.
// Chaque logo ouvre le site officiel du client ; sans site connu (lieu fermé…), la page du chantier.
const LOGO_DIR = path.join(ROOT, "assets/img/logos");
const CLIENT_SITES = {
  "hotel-panache": "https://www.hotelpanache.com",
  "loro-piana": "https://www.loropiana.com",
  byredo: "https://www.byredo.com",
  "le-grand-pigalle": "https://www.experimentalgroup.com/paris/grand-pigalle-experimental",
  "hotel-paradis": "https://www.hotelparadisparis.com",
  "tartine-et-chocolat-harrods": "https://www.tartine-et-chocolat.com",
  "hotel-bienvenue": "https://hotelbienvenue.fr",
  "petite-mendigote": "https://petitemendigote.com",
  "mojo-kitchen": "https://mojoforgood-opera.fr",
};
const brandLogos = () => {
  const brands = PROJECTS.filter((p) => p.category !== "particulier");
  const item = (p) => {
    const file = ["svg", "png", "webp"].map((x) => `${p.id}.${x}`).find((f) => fs.existsSync(path.join(LOGO_DIR, f)));
    const name = p.title.split(" · ").pop();
    const inner = file ? `<img src="/assets/img/logos/${file}" alt="${esc(p.title)}" loading="lazy" />` : `<span>${esc(name)}</span>`;
    const site = CLIENT_SITES[p.id];
    const link = site ? `href="${site}" target="_blank" rel="noopener" aria-label="${esc(name)} (site officiel, nouvel onglet)"` : `href="${projectUrl(p)}"`;
    return `<a class="logos__item${file ? "" : " logos__item--text"}" ${link}>${inner}</a>`;
  };
  const row = brands.map(item).join("");
  return `<section class="logos" aria-labelledby="logos-t">
      <div class="logos__head"><span class="logos__mark" aria-hidden="true"></span><h2 class="logos__t" id="logos-t">Ils nous ont fait confiance</h2><span class="logos__line" aria-hidden="true"></span></div>
      <div class="logos__viewport"><div class="logos__track">${row}<div class="logos__dup" aria-hidden="true">${row.replace(/<a /g, '<a tabindex="-1" ')}</div></div></div>
    </section>`;
};

// Accueil · nos chantiers en cartes photo (les chantiers mis en avant, puis les suivants jusqu'à 6)
const worksCards = () => {
  const list = [...featured, ...PROJECTS.filter((p) => !p.featured && p.category !== "particulier")].slice(0, 6);
  return `<div class="works__grid">
            ${list.map((p) => `<a class="works__card reveal" href="${projectUrl(p)}">
              <figure class="works__img">${img(PHOTOS[p.id][0], `${p.title}, ${LEAD[p.category].toLowerCase()} par EMBI`, 'loading="lazy"')}</figure>
              <h3 class="works__t">${esc(p.title)}</h3>
              <span class="works__cat">${CATEGORIES_LABEL[p.category]}</span>
            </a>`).join("\n            ")}
          </div>`;
};

// Accueil · carrousel des chantiers : grande photo + aperçu de la suivante + bande « Découvrir nos réalisations »
const showcase = () => {
  const list = [...featured, ...PROJECTS.filter((p) => !p.featured && p.category !== "particulier")].slice(0, 7);
  return `<div class="show" id="showcase">
          <div class="show__main">
            ${list.map((p, i) => `<a class="show__slide${i ? "" : " is-active"}" href="${projectUrl(p)}"${i ? ' tabindex="-1"' : ""}>${img(PHOTOS[p.id][0], `${p.title}, ${LEAD[p.category].toLowerCase()} par EMBI`, i ? 'loading="lazy"' : "")}<span class="show__cap">${esc(p.title)}</span></a>`).join("\n            ")}
            <div class="show__dots">${list.map((p, i) => `<button type="button"${i ? "" : ' class="is-on"'} aria-label="${esc(p.title)}"></button>`).join("")}</div>
          </div>
          <button class="show__peek" type="button" aria-label="Chantier suivant">
            ${list.map((p, i) => `<span class="show__pimg${i === 1 ? " is-active" : ""}">${img(PHOTOS[p.id][0], "", 'loading="lazy"')}</span>`).join("\n            ")}
          </button>
          <a class="show__band pattern" href="/realisations/"><span>Découvrir nos réalisations</span></a>
        </div>`;
};

// Accueil · les 4 secteurs en cartes photo (fondu vers le fond, titre dessous)
const sectorCardsPhoto = () => `<div class="works__grid works__grid--4">
            ${SECTORS.map((s) => {
              const list = PROJECTS.filter((p) => p.category === s.category);
              const cover = [...list].sort((a, b) => (a.featured || 99) - (b.featured || 99))[0];
              return `<a class="works__card reveal" href="${s.path}">
              <figure class="works__img">${img(PHOTOS[cover.id][0], `${cover.title}, ${LEAD[cover.category].toLowerCase()} par EMBI`, 'loading="lazy"')}</figure>
              <h3 class="works__t">${s.nav}</h3>
            </a>`;
            }).join("\n            ")}
          </div>`;

// Accueil · en images : 4 photos de chantiers ; l'en-tête devient « Suivez-nous » si social.instagram est renseigné
const insta = () => {
  const ig = cfg.social.instagram;
  const handle = ig ? "@" + ig.replace(/\/+$/, "").split("/").pop() : "EMBI en images";
  const pics = ["hotel-paradis", "loustic", "le-grand-pigalle", "petite-mendigote"].map((id) => PROJECTS.find((p) => p.id === id)).filter(Boolean);
  const icon = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor"/></svg>`;
  return `<section class="pn insta" aria-label="${ig ? "Instagram" : "EMBI en images"}">
      <div class="pn__wrap">
        <div class="insta__head">${ig ? `<a class="insta__icon" href="${esc(ig)}" target="_blank" rel="noopener" aria-label="Instagram EMBI">${icon}</a>` : `<span class="insta__icon">${icon}</span>`}<span class="insta__handle">${esc(handle)}</span><span class="insta__line" aria-hidden="true"></span>${ig ? `<a class="insta__follow" href="${esc(ig)}" target="_blank" rel="noopener">Suivez-nous</a>` : `<a class="insta__follow" href="/realisations/">Voir les réalisations</a>`}</div>
        <div class="insta__grid">
          ${pics.map((p) => `<a href="${ig ? esc(ig) : projectUrl(p)}"${ig ? ' target="_blank" rel="noopener"' : ""} class="insta__pic">${img(PHOTOS[p.id][0], `${p.title}, ${LEAD[p.category].toLowerCase()} par EMBI`, 'loading="lazy"')}</a>`).join("\n          ")}
        </div>
      </div>
    </section>`;
};

const BLOCKS = {
  showcase,
  "sector-cards-photo": sectorCardsPhoto,
  insta,
  "brand-logos": brandLogos,
  "works-cards": worksCards,
  "hero-slides": heroSlides,
  "sector-mosaic": sectorMosaic,
  "sector-cards": sectorCards,
  "method-brief": () => methodBrief(),
  "featured-cards": () => `<div class="pj-cards pj-cards--featured">
          ${featured.map((p) => card(p, "h3")).join("\n          ")}
        </div>`,
  "all-cards": () => `<div class="pj-cards pj-cards--grid" id="grid">
          ${PROJECTS.map((p) => card(p, "h3")).join("\n          ")}
        </div>`,
  "grid-filters": () => `<div class="filters" role="group" aria-label="Filtrer les réalisations">
            <button type="button" class="filter is-active" data-filter="all" aria-pressed="true">Tout <sup>${PROJECTS.length}</sup></button>
            ${SECTORS.map((s) => `<button type="button" class="filter" data-filter="${s.category}" aria-pressed="false">${s.nav} <sup>${PROJECTS.filter((p) => p.category === s.category).length}</sup></button>`).join("\n            ")}
          </div>`,
  // liste des réalisations en accordéon (présentation typographique, photo à l'ouverture)
  refs: () => `<section class="refs section section--dark" id="realisations">
      <div class="container">
        <div class="section__head">
          <div>
            <p class="eyebrow reveal">Réalisations</p>
            <h2 class="h2 reveal">Ils nous ont<br /><em>confié leurs lieux.</em></h2>
          </div>
          <div class="refs__side reveal">
            <p class="section__aside">Des maisons de luxe aux hôtels parisiens, en passant par les restaurants et les appartements de particuliers : la même exigence, à chaque chantier.</p>
            <div class="filters filters--dark" role="group" aria-label="Filtrer les réalisations">
              <button class="filter is-active" data-filter="all" aria-pressed="true">Tout <sup>${PROJECTS.length}</sup></button>
              ${SECTORS.map((s) => `<button class="filter" data-filter="${s.category}" aria-pressed="false">${s.nav} <sup>${PROJECTS.filter((p) => p.category === s.category).length}</sup></button>`).join("\n              ")}
            </div>
          </div>
        </div>
        <ul class="acc" id="refsList">
          ${PROJECTS.map((p, i) => {
            const txt = p.text || `${LEAD[p.category] || "Lieu rénové"} clé en main par EMBI, de l'étude de faisabilité à la livraison.`;
            return `<li class="acc__item" data-cat="${p.category}">
            <button class="acc__head" type="button" aria-expanded="false" aria-controls="acc-${i}" data-i="${i}">
              <span class="acc__n">${String(i + 1).padStart(2, "0")}</span><span class="acc__t">${esc(p.title)}</span><span class="acc__c">${esc(CATEGORIES[p.category] || "")}</span><span class="acc__ar" aria-hidden="true">→</span>
            </button>
            <div class="acc__panel" id="acc-${i}" role="region" aria-label="${esc(p.title)}"><div class="acc__inner">
              <a class="acc__img" href="${projectUrl(p)}" tabindex="-1">${img(cover(p), `${p.title}, ${(LEAD[p.category] || "lieu rénové").toLowerCase()} par EMBI`, 'loading="lazy"')}</a>
              <div class="acc__body"><p>${esc(txt)}</p><a class="btn btn--accent acc__open" href="${projectUrl(p)}">Voir le projet ${esc(p.title)} <span aria-hidden="true">→</span></a></div>
            </div></div>
          </li>`;
          }).join("\n          ")}
        </ul>
        <div class="cta-band cta-band--dark reveal">
          <p class="cta-band__title">Votre lieu, <em>notre prochaine réalisation&nbsp;?</em></p>
          <div class="cta-band__actions">
            <a href="/contact/" class="btn btn--accent" data-magnetic>Demander un devis gratuit <span aria-hidden="true">→</span></a>
            <a href="/contact/#projet" class="btn btn--outline-light">Estimer mon projet en 3 questions</a>
          </div>
        </div>
      </div>
    </section>`,
  "signature-cards": () => `<div class="pj-cards">${["loro-piana", "byredo", "tartine-et-chocolat-harrods", "hotel-panache", "hotel-paradis", "le-grand-pigalle"].map((id) => card(PROJECTS.find((p) => p.id === id), "h3")).join("")}</div>`,
  "sector-links": () => SECTORS.map((s) => `<a href="${s.path}">${s.nav}</a>`).join(" · "),
};
const FORM_ID = cfg.formsubmit || "sec@embi.fr";
const expand = (html) =>
  html
    .replace(/\{\{form:action\}\}/g, `https://formsubmit.co/${FORM_ID}`)
    .replace(/\{\{site\}\}/g, SITE)
    .replace(/\{\{doc:(\w+)\}\}/g, (m, k) => doc(k))
    .replace(/\{\{photo:([\w-]+)\}\}/g, (m, k) => sitePhoto(k).src)
    .replace(/\{\{logo\}\}/g, () => HEADER.match(/<svg class="logo__svg"[\s\S]*?<\/svg>/)[0])
    .replace(/\{\{projimg:([\w-]+)\|([^}]*)\}\}/g, (m, id, alt) => {
      if (!PHOTOS[id]) throw new Error(`chantier inconnu : ${id}`);
      return img(PHOTOS[id][0], alt, 'loading="lazy"');
    })
    .replace(/\{\{img:([\w-]+)\|([^}]*)\}\}/g, (m, k, rest) => {
      const [alt, extra = ""] = rest.split("|");
      return img(sitePhoto(k), alt, extra);
    })
    .replace(/\{\{funnel(?::(\w+))?\}\}/g, (m, c) => expand(funnel(c)))
    .replace(/\{\{block:([\w-]+)\}\}/g, (m, k) => {
      if (!BLOCKS[k]) throw new Error(`bloc inconnu : ${k}`);
      return BLOCKS[k]();
    });

/* ───── 1 · Pages écrites à la main : src/pages/*.html ───── */
fs.readdirSync(path.join(ROOT, "src/pages"))
  .filter((f) => f.endsWith(".html"))
  .forEach((f) => {
    const src = read(`src/pages/${f}`);
    const m = src.match(/^<!--\s*(\{[\s\S]*?\})\s*-->\s*/);
    if (!m) throw new Error(`src/pages/${f} : en-tête JSON manquant`);
    const meta = JSON.parse(m[1]);
    layout({ ...meta, content: expand(src.slice(m[0].length)) });
  });

/* ───── 2 · Pages secteur ───── */
const SECTOR_TPL = read("src/templates/secteur.html");
SECTORS.forEach((s) => {
  const list = PROJECTS.filter((p) => p.category === s.category);
  const works = [...new Set([...list.flatMap((p) => p.travaux || []), ...(s.extraWorks || [])])];
  const others = SECTORS.filter((o) => o !== s);
  layout({
    path: s.path,
    key: "secteur",
    title: s.title,
    description: s.description,
    crumbs: [{ name: s.nav, path: s.path }],
    ogImage: list[0] && cover(list[0]).src,
    bodyAttrs: ` data-cta-type="${s.category}"`,
    content: fill(SECTOR_TPL, {
      hero: pageHero([{ name: s.nav, path: s.path }], s.h1, esc(s.lead), `<a href="#projet" class="btn btn--accent">Demander un devis gratuit <span aria-hidden="true">→</span></a><a href="#chantiers" class="btn btn--outline-light">Voir nos chantiers</a>`, true),
      paragraphs: s.paragraphs.map((t) => `<!-- À RELIRE -->\n          <p class="reveal">${esc(t)}</p>`).join("\n          "),
      works: works.map((w) => `<li>${esc(w)}</li>`).join(""),
      count: `${list.length} chantier${list.length > 1 ? "s" : ""}`,
      plural: PLURAL[s.category],
      cards: list.map((p) => card(p, "h3")).join("\n          "),
      steps: methodBrief("h3"),
      others: others.map((o) => `<a class="btn btn--ghost" href="${o.path}">${o.nav}</a>`).join(""),
      cta: expand(funnel(s.category)),
    }),
  });
});

/* ───── 3 · Pages chantier ───── */
const PROJECT_TPL = read("src/templates/projet.html");
PROJECTS.forEach((p, i) => {
  const cat = CATEGORIES[p.category] || "";
  const sec = sectorOf(p.category);
  const photos = PHOTOS[p.id];
  const lead = p.text || `${LEAD[p.category] || "Lieu rénové"} clé en main par EMBI, de l'étude de faisabilité à la livraison.`;
  const description = p.text
    ? `${p.title} (${cat.toLowerCase()}, Paris) : ${p.text} Rénovation clé en main par EMBI, photos et détails du chantier.`
    : `${p.title} : ${(LEAD[p.category] || "lieu rénové").toLowerCase()} clé en main par EMBI à Paris. Photos et détails du chantier.`;
  const facts = [["Secteur", `<a href="${sec.path}">${esc(cat)}</a>`], ["Lieu", esc(p.lieu)], ["Année", esc(p.annee)], ["Surface", esc(p.surface)], ["Durée", esc(p.duree)], ["Décoration", esc(p.deco)], ["Architecte", esc(p.archi)], ["Prestation", "Clé en main"]].filter(([, v]) => v);
  const story = p.histoire && p.histoire.length ? p.histoire : [
    "Comme pour chaque chantier EMBI, ce projet a été mené de A à Z : étude de faisabilité, chiffrage transparent poste par poste, puis coordination de tous les corps de métier jusqu'à la livraison.",
    "Un interlocuteur unique a suivi le chantier du premier rendez-vous à la remise des clés, avec le souci du détail et le respect des délais qui font la réputation d'EMBI.",
  ];
  const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length], next = PROJECTS[(i + 1) % PROJECTS.length];
  const same = PROJECTS.filter((q) => q.category === p.category && q.id !== p.id);
  const more = same.concat(PROJECTS.filter((q) => q.category !== p.category && q.id !== p.id)).slice(0, 3);
  const path_ = projectUrl(p);
  layout({
    path: path_,
    key: "realisations",
    title: `${p.title} · ${cat} rénové à Paris | EMBI`,
    ogTitle: `${p.title} | EMBI, rénovation à Paris`,
    description,
    ogType: "article",
    ogImage: photos[0].src,
    preload: photos[0].srcset ? null : photos[0].src,
    bodyClass: "page-projet",
    bodyAttrs: ` data-project="${p.id}" data-cta-type="${p.category}"`,
    scripts: ["projet"],
    lightbox: true,
    crumbs: [{ name: "Réalisations", path: "/realisations/" }, { name: p.title, path: path_ }],
    jsonld: [{ "@type": "CreativeWork", name: `${p.title} : ${(LEAD[p.category] || "rénovation").toLowerCase()} par EMBI`, url: SITE + path_, image: photos.slice(0, 6).map((ph) => abs(ph.src)), about: cat, creator: { "@id": `${SITE}/#entreprise` } }],
    content: fill(PROJECT_TPL, {
      title: esc(p.title),
      category: p.category,
      cover: img(photos[0], `${p.title}, ${(LEAD[p.category] || "lieu rénové").toLowerCase()} par EMBI`, 'id="pjCover" fetchpriority="high" data-hero'),
      catLine: `<a href="${sec.path}">${esc(cat)}</a>${p.lieu ? ` · ${esc(p.lieu)}` : ""}${p.annee ? ` · ${esc(p.annee)}` : ""}`,
      lead: esc(lead),
      facts: `<p class="pj-facts__title">Le projet en bref</p><dl>${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>`,
      storyTitle: esc(`${LEAD[p.category] || "Lieu rénové"} clé en main à Paris`),
      story: story.map((t) => `<p>${esc(t)}</p>`).join(""),
      works: p.travaux && p.travaux.length ? `<h3 class="pj-works__h">Les travaux</h3><ul class="pj-works" id="pjWorks">${p.travaux.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : "",
      result: p.deco || p.archi
        ? `<p class="pj-result">${p.deco ? `Une réalisation clé en main sur une décoration signée ${esc(p.deco)}.` : `Une réalisation clé en main sur un projet de l'architecte ${esc(p.archi)}.`} Découvrez le résultat en images ci-dessous.</p>`
        : `<p class="pj-result">Découvrez le résultat en images ci-dessous.</p>`,
      count: photos.length > 1 ? `${photos.length} photos · cliquez pour agrandir` : "Cliquez sur la photo pour l'agrandir",
      singleClass: photos.length === 1 ? " is-single" : "",
      gallery: photos.map((ph, k) => `<button type="button" class="pj-shot" data-k="${k}" data-full="${esc(ph.srcset ? ph.srcset.split(", ").pop().split(" ")[0] : ph.src)}" aria-label="Agrandir la photo ${k + 1}">${img(ph, `${p.title}, photo ${k + 1} du chantier`, `loading="${k < 4 ? "eager" : "lazy"}"`)}</button>`).join(""),
      sectorPath: sec.path,
      sectorPlural: PLURAL[p.category],
      prevNext: `<a class="pj-nav__link pj-nav__link--prev" href="${projectUrl(prev)}"><span>← Chantier précédent</span><strong>${esc(prev.title)}</strong></a><a class="pj-nav__link pj-nav__link--next" href="${projectUrl(next)}"><span>Chantier suivant →</span><strong>${esc(next.title)}</strong></a>`,
      moreTitle: same.length ? `Autres <em>${esc(PLURAL[p.category])}.</em>` : "Autres <em>réalisations.</em>",
      more: more.map((q) => card(q, "h3")).join(""),
      funnel: expand(funnel(p.category)),
    }),
  });
});

/* ───── 3b · Rénovation (intérieure, énergétique, extérieure) ───── */
const SERVICES = require(path.join(ROOT, "src/data/services.js"));
const ARTICLES = fs.existsSync(path.join(ROOT, "src/data/articles.js")) ? require(path.join(ROOT, "src/data/articles.js")) : [];
const MAG_CATS = { projet: "Chantier", "renovation-interieure": "Rénovation intérieure", "renovation-energetique": "Rénovation énergétique", exterieur: "Extérieur", signature: "Signature", urgence: "Urgence" };
const MAG_COVER = { "renovation-interieure": "renovation-appartement", "renovation-energetique": "appartement-prive", exterieur: "hotel-bienvenue", signature: "byredo", urgence: "hotel-paradis" };
const articleUrl = (a) => `/mag/${a.slug}/`;
const articleCover = (a) => PHOTOS[a.project && PHOTOS[a.project] ? a.project : MAG_COVER[a.category] || "hotel-panache"][0];
const frDate = (d) => new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const articleCard = (a, level = "h3") => `<a class="mag-card reveal" href="${articleUrl(a)}">
            <span class="mag-card__img">${img(articleCover(a), a.title, 'loading="lazy"')}</span>
            <span class="mag-card__cat">${esc(MAG_CATS[a.category] || "")} · ${a.readingTime} min</span>
            <${level} class="mag-card__t">${esc(a.title)}</${level}>
            <span class="mag-card__lead">${esc(a.lead)}</span>
          </a>`;
const faqBlock = (items) => items.length ? `    <section class="section faq">
      <div class="container faq__inner">
        <h2 class="h2 reveal">Questions <em>fréquentes.</em></h2>
        <div class="faq__list">
          ${items.map(([q, a]) => `<details class="faq__item"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n          ")}
        </div>
      </div>
    </section>` : "";
const faqLd = (items) => items.length ? [{ "@type": "FAQPage", mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }] : [];
const svcCover = (sv) => PHOTOS[{ interieur: "renovation-appartement", energetique: "appartement-prive", exterieur: "hotel-bienvenue" }[sv.slug]][0];

layout({
  path: "/renovation/",
  key: "renovation",
  title: "Rénovation à Paris : intérieure, énergétique et extérieure | EMBI",
  description: "Rénovation intérieure, rénovation énergétique et travaux extérieurs à Paris : EMBI coordonne 40 professionnels de tous corps de métier, avec un seul interlocuteur de A à Z.",
  crumbs: [{ name: "Rénovation", path: "/renovation/" }],
  content: expand(`${pageHero([{ name: "Rénovation", path: "/renovation/" }], "Rénovation, <em>de l'intérieur jusqu'au toit.</em>", "Rénovation intérieure, performance énergétique, façades et toitures : EMBI coordonne 40 professionnels de tous corps de métier, avec un seul interlocuteur, de l'étude à la livraison.", `<a href="#projet" class="btn btn--accent">Demander un devis gratuit <span aria-hidden="true">→</span></a><a href="#types" class="btn btn--outline-light">Nos rénovations</a>`)}
    <section class="pn works" id="types">
      <div class="pn__wrap">
        <div class="works__head reveal">
          <h2 class="works__title">Trois métiers, un seul interlocuteur</h2>
          <p>Choisissez votre type de rénovation : chaque page détaille nos prestations, nos chantiers et les questions à se poser avant de commencer.</p>
        </div>
        <div class="works__grid">
          ${SERVICES.map((sv) => `<a class="works__card reveal" href="/renovation/${sv.slug}/">
            <figure class="works__img">${img(svcCover(sv), sv.nav, 'loading="lazy"')}</figure>
            <h3 class="works__t">${esc(sv.nav)}</h3>
            <span class="works__cat">${esc(sv.card)}</span>
          </a>`).join("\n          ")}
        </div>
        <p class="sector__others reveal">Aussi&nbsp;: <a class="btn btn--ghost" href="/conception-sur-mesure/">Conception sur mesure</a><a class="btn btn--ghost" href="/savoir-faire/">Savoir-faire</a><a class="btn btn--ghost" href="/methode/">Notre méthode</a><a class="btn btn--ghost" href="/showroom/">Showroom</a></p>
      </div>
    </section>
    {{funnel}}`),
});

SERVICES.forEach((sv) => {
  const path_ = `/renovation/${sv.slug}/`;
  const crumbs = [{ name: "Rénovation", path: "/renovation/" }, { name: sv.nav, path: path_ }];
  const projs = PROJECTS.filter((p) => sv.categories.includes(p.category)).sort((a, b) => (a.featured || 99) - (b.featured || 99)).slice(0, 3);
  const arts = ARTICLES.filter((a) => a.category === { interieur: "renovation-interieure", energetique: "renovation-energetique", exterieur: "exterieur" }[sv.slug]).slice(0, 3);
  layout({
    path: path_,
    key: "renovation",
    title: sv.title,
    description: sv.description,
    crumbs,
    jsonld: [{ "@type": "Service", name: sv.nav, areaServed: "Paris et Île-de-France", provider: { "@id": `${SITE}/#entreprise` }, url: SITE + path_ }, ...faqLd(sv.faq)],
    content: expand(`${pageHero(crumbs, sv.h1, esc(sv.lead), `<a href="#projet" class="btn btn--accent">Demander un devis gratuit <span aria-hidden="true">→</span></a><a href="#prestations" class="btn btn--outline-light">Nos prestations</a>`, true)}
    <section class="section svc" id="prestations">
      <div class="container">
        <div class="section__head">
          <div><p class="eyebrow reveal">Nos prestations</p><h2 class="h2 reveal">${esc(sv.nav)}, <em>clé en main.</em></h2></div>
          <p class="section__aside reveal">Un interlocuteur dédié coordonne chaque corps de métier, de l'étude de faisabilité à la livraison.</p>
        </div>
        <ol class="svc__grid">
          ${sv.services.map(([t, d], i) => `<li class="svc__item reveal"><span class="svc__n">${String(i + 1).padStart(2, "0")}</span><h3 class="svc__t">${esc(t)}</h3><p>${esc(d)}</p></li>`).join("\n          ")}
        </ol>
        ${sv.rge ? `<!-- À RELIRE : n'afficher que si la qualification RGE est confirmée -->
        <div class="svc__rge reveal"><strong>RGE</strong><p>Les aides publiques à la rénovation énergétique sont réservées aux travaux réalisés par des entreprises qualifiées RGE (Reconnu Garant de l'Environnement). Nous vous orientons vers les dispositifs en vigueur dès l'étude de votre projet.</p></div>` : ""}
      </div>
    </section>
    <section class="section section--tight">
      <div class="container">
        <div class="section__head"><div><p class="eyebrow reveal">Réalisations</p><h2 class="h2 reveal">Ils nous ont <em>confié leurs lieux.</em></h2></div><a href="/realisations/" class="btn btn--ghost">Toutes les réalisations <span aria-hidden="true">→</span></a></div>
        <div class="pj-cards">${projs.map((p) => card(p, "h3")).join("")}</div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section__head"><div><p class="eyebrow reveal">Méthode</p><h2 class="h2 reveal">De l'étude <em>à la livraison.</em></h2></div><a href="/methode/" class="btn btn--ghost">Notre méthode en détail <span aria-hidden="true">→</span></a></div>
        ${methodBrief("h3")}
        <p class="sector__others">Nos autres rénovations&nbsp;: ${SERVICES.filter((o) => o !== sv).map((o) => `<a class="btn btn--ghost" href="/renovation/${o.slug}/">${o.nav}</a>`).join("")}</p>
      </div>
    </section>
${faqBlock(sv.faq)}
${arts.length ? `    <section class="section section--tight"><div class="container"><div class="section__head"><div><p class="eyebrow reveal">Le Mag</p><h2 class="h2 reveal">À lire <em>avant de commencer.</em></h2></div><a href="/mag/" class="btn btn--ghost">Tous les articles <span aria-hidden="true">→</span></a></div><div class="mag-grid">${arts.map((a) => articleCard(a)).join("")}</div></div></section>` : ""}
    {{funnel}}`),
  });
});

/* ───── 3c · Le Mag ───── */
if (ARTICLES.length) {
  layout({
    path: "/mag/",
    key: "mag",
    title: "Le Mag EMBI : conseils et chantiers de rénovation à Paris",
    description: "Conseils de rénovation intérieure, énergétique et extérieure, coulisses de nos chantiers d'hôtels et de boutiques à Paris : le magazine d'EMBI, entreprise de rénovation clé en main.",
    crumbs: [{ name: "Le Mag", path: "/mag/" }],
    content: expand(`${pageHero([{ name: "Le Mag", path: "/mag/" }], "Le Mag, <em>conseils et chantiers.</em>", "Rénovation intérieure, performance énergétique, façades, urgences, et les coulisses de nos chantiers d'hôtels et de boutiques à Paris.")}
    <section class="section mag" id="articles">
      <div class="container">
        <div class="mag__filters" role="group" aria-label="Filtrer les articles">
          <button type="button" class="mag__f is-on" data-f="">Tout</button>
          ${Object.entries(MAG_CATS).filter(([k]) => ARTICLES.some((a) => a.category === k)).map(([k, v]) => `<button type="button" class="mag__f" data-f="${k}">${v}</button>`).join("\n          ")}
        </div>
        <div class="mag-grid" id="magGrid">
          ${ARTICLES.map((a) => articleCard(a, "h2").replace('class="mag-card reveal"', `class="mag-card reveal" data-cat="${a.category}"`)).join("\n          ")}
        </div>
      </div>
    </section>
    {{funnel}}`),
  });
  ARTICLES.forEach((a) => {
    const path_ = articleUrl(a);
    const proj = a.project && PROJECTS.find((p) => p.id === a.project);
    const others = ARTICLES.filter((o) => o !== a).sort((x, y) => (y.category === a.category) - (x.category === a.category)).slice(0, 3);
    const faq = (a.faq || []).map((f) => [f.q, f.a]);
    const crumbs = [{ name: "Le Mag", path: "/mag/" }, { name: a.title, path: path_ }];
    layout({
      path: path_,
      key: "mag",
      title: a.metaTitle,
      description: a.description,
      ogType: "article",
      ogImage: articleCover(a).src,
      crumbs,
      jsonld: [{ "@type": "BlogPosting", headline: a.title, description: a.description, datePublished: a.date, dateModified: a.date, image: abs(articleCover(a).src), url: SITE + path_, mainEntityOfPage: SITE + path_, author: { "@id": `${SITE}/#entreprise` }, publisher: { "@id": `${SITE}/#entreprise` } }, ...faqLd(faq)],
      content: expand(`    <article class="post">
      <header class="cs-hero page-hero post__hero">
        <div class="container page-hero__inner">
          <nav class="pj-crumbs" aria-label="Fil d'Ariane"><a href="/">Accueil</a><span aria-hidden="true">/</span><a href="/mag/">Le Mag</a><span aria-hidden="true">/</span><span>${esc(MAG_CATS[a.category] || "")}</span></nav>
          <h1 class="cs-hero__title">${esc(a.title)}</h1>
          <p class="post__meta"><span>${esc(MAG_CATS[a.category] || "")}</span><span><time datetime="${a.date}">${frDate(a.date)}</time></span><span>${a.readingTime} min de lecture</span></p>
          <p class="cs-hero__lead">${esc(a.lead)}</p>
        </div>
      </header>
      <figure class="post__cover">${img(articleCover(a), a.title, 'fetchpriority="high"')}</figure>
      <div class="post__body">
        ${a.sections.map((sc) => `<h2>${esc(sc.h2)}</h2>\n        ${(sc.paras || []).map((t) => `<p>${esc(t)}</p>`).join("\n        ")}${sc.list && sc.list.length ? `\n        <ul>${sc.list.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}`).join("\n        ")}
        ${proj ? `<aside class="post__proj"><p class="eyebrow">Le chantier</p>${card(proj, "h3")}</aside>` : ""}
        ${a.links && a.links.length ? `<nav class="post__links" aria-label="Pour aller plus loin"><p class="eyebrow">Pour aller plus loin</p>${a.links.map((l) => `<a href="${l.href}">${esc(l.label)} <span aria-hidden="true">→</span></a>`).join("")}</nav>` : ""}
      </div>
    </article>
${faqBlock(faq)}
    <section class="section section--tight"><div class="container"><div class="section__head"><div><p class="eyebrow reveal">Le Mag</p><h2 class="h2 reveal">À lire <em>aussi.</em></h2></div><a href="/mag/" class="btn btn--ghost">Tous les articles <span aria-hidden="true">→</span></a></div><div class="mag-grid">${others.map((o) => articleCard(o)).join("")}</div></div></section>
    {{funnel:${proj ? proj.category : ""}}}`),
    });
  });
}

/* ───── 4 · Contrôles qualité ───── */
const titles = new Map(), descs = new Map();
pages.forEach((pg) => {
  const h1 = (pg.html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) warn(`${pg.path} : ${h1} balise(s) H1 (attendu : 1).`);
  const noAlt = (pg.html.match(/<img(?![^>]*\balt=)[^>]*>/g) || []).filter((t) => !t.includes('id="lbImg"'));
  if (noAlt.length) warn(`${pg.path} : ${noAlt.length} image(s) sans attribut alt.`);
  if (!pg.noindex) {
    if (titles.has(pg.title)) warn(`titre en double : ${pg.path} et ${titles.get(pg.title)}`);
    if (descs.has(pg.description)) warn(`description en double : ${pg.path} et ${descs.get(pg.description)}`);
    titles.set(pg.title, pg.path); descs.set(pg.description, pg.path);
  }
});
const known = new Set(pages.map((pg) => pg.path));
pages.forEach((pg) =>
  (pg.html.match(/href="(\/[^"#?]*)/g) || []).map((h) => h.slice(6)).forEach((h) => {
    if (h.startsWith("/assets/") || h.startsWith("/documents/") || h.startsWith("/images/")) return;
    if (!known.has(h)) warn(`${pg.path} : lien interne vers ${h} introuvable.`);
  })
);

/* ───── 5 · Écriture de dist/ ───── */
fs.rmSync(OUT, { recursive: true, force: true });
const copyDir = (from, to, filter = () => true) => {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) copyDir(a, b, filter);
    else if (filter(e.name)) fs.copyFileSync(a, b);
  }
};
copyDir(path.join(ROOT, "assets"), path.join(OUT, "assets"), (n) => n !== "manifest.json");
copyDir(path.join(ROOT, "images"), path.join(OUT, "images"), (n) => !n.startsWith("."));
copyDir(path.join(ROOT, "documents"), path.join(OUT, "documents"), (n) => n.endsWith(".pdf"));

pages.forEach((pg) => {
  const file = pg.path.endsWith(".html") ? pg.path : pg.path + "index.html";
  fs.mkdirSync(path.dirname(path.join(OUT, file)), { recursive: true });
  fs.writeFileSync(path.join(OUT, file), pg.html);
});

// données pour les scripts du navigateur (menu, chantiers signature, filtres, questionnaire, showroom)
fs.writeFileSync(path.join(OUT, "assets/js/projects.js"), `/* Généré par scripts/build.js depuis src/data/projects.js : ne pas modifier à la main. */
window.EMBI_ROOT = "/";
window.EMBI_CATEGORIES = ${JSON.stringify(CATEGORIES)};
window.EMBI_SECTORS = ${JSON.stringify(Object.fromEntries(SECTORS.map((s) => [s.category, s.path])))};
window.EMBI_PROJECTS = ${JSON.stringify(PROJECTS.map((p) => ({ id: p.id, title: p.title, category: p.category, featured: p.featured || 0, text: p.text || "", images: PHOTOS[p.id].map((ph) => ph.src) })))};
window.EMBI_PROJECT_URL = (id) => "/realisations/" + encodeURIComponent(id) + "/";
window.EMBI_DOCS = ${JSON.stringify(Object.fromEntries(Object.keys(DOCS).map((k) => [k, doc(k)])))};
window.EMBI_SITE_IMG = ${JSON.stringify(Object.fromEntries(Object.keys(SITE_IMAGES).map((k) => [k, sitePhoto(k).src])))};
`);

// anciennes adresses → nouvelles (redirections 301)
const redirects = [
  ["/index.html", "/"],
  ["/realisations.html", "/realisations/"],
  ["/conception.html", "/conception-sur-mesure/"],
  ["/conception", "/conception-sur-mesure/"],
  ["/savoir-faire.html", "/savoir-faire/"],
  ["/methode.html", "/methode/"],
  ["/showroom.html", "/showroom/"],
  ["/contact.html", "/contact/"],
  ["/mentions-legales.html", "/mentions-legales/"],
  ["/confidentialite.html", "/politique-de-confidentialite/"],
  ["/confidentialite", "/politique-de-confidentialite/"],
  ...PROJECTS.flatMap((p) => [[`/realisations/${p.id}.html`, projectUrl(p)], ...(p.oldId ? [[`/realisations/${p.oldId}.html`, projectUrl(p)], [`/realisations/${p.oldId}/`, projectUrl(p)]] : [])]),
];
fs.writeFileSync(path.join(OUT, "_redirects"), `# Généré par scripts/build.js : anciennes adresses du site → nouvelles adresses
${redirects.map(([a, b]) => `${a}  ${b}  301`).join("\n")}
`);
// ancienne adresse projet.html?p=<id> : la page redirige vers la bonne page chantier
const OLD_IDS = Object.fromEntries(PROJECTS.map((p) => [p.oldId || p.id, p.id]));
fs.writeFileSync(path.join(OUT, "projet.html"), `<!doctype html>
<html lang="fr"><head><meta charset="utf-8" /><meta name="robots" content="noindex" /><title>Réalisation | EMBI</title>
<script>(function () { var ids = ${JSON.stringify(OLD_IDS)}; var id = new URLSearchParams(location.search).get("p"); location.replace(ids[id] ? "/realisations/" + ids[id] + "/" : "/realisations/"); })();</script>
<link rel="canonical" href="${SITE}/realisations/" /></head>
<body><p>Redirection vers <a href="/realisations/">nos réalisations</a>…</p></body></html>
`);

const indexable = pages.filter((pg) => !pg.noindex && !pg.path.endsWith(".html"));
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map((pg) => `  <url><loc>${SITE}${pg.path}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);
fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`);

console.log(`✓ ${pages.length} pages générées dans dist/ (${indexable.length} dans le sitemap) · adresse : ${SITE} · photos : ${manifest ? "locales" : "ancien site"} · PDF : ${cfg.documents === "local" ? "locaux" : "ancien site"}`);
if (warnings.length) {
  console.log(`\n⚠ ${warnings.length} point(s) à vérifier :`);
  warnings.forEach((w) => console.log("  - " + w));
  if (process.env.STRICT) process.exit(1);
}
