/*
 * ─────────────────────────────────────────────────────────────
 *  BANDEAU COOKIES + GOOGLE CONSENT MODE V2
 *  À charger dans le <head> de chaque page, AVANT tout outil Google.
 *
 *  Pour activer la mesure d'audience ou la publicité, renseignez les
 *  identifiants ci-dessous : la catégorie correspondante apparaît
 *  alors dans le bandeau, et l'outil n'est chargé qu'après accord.
 *    GA4_ID  : "G-XXXXXXXXXX"   (Google Analytics 4)
 *    ADS_ID  : "AW-XXXXXXXXXX"  (Google Ads)
 * ─────────────────────────────────────────────────────────────
 */
(() => {
  const GA4_ID = "";
  const ADS_ID = "";

  const KEY = "embi-consent";
  const VERSION = 1;
  const MAX_AGE = 1000 * 60 * 60 * 24 * 182; // choix redemandé au bout de 6 mois (recommandation CNIL)

  /* ───── Google Consent Mode v2 : tout refusé par défaut ───── */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500,
  });
  gtag("set", "ads_data_redaction", true);
  gtag("set", "url_passthrough", false);

  const CATS = [
    { id: "media", label: "Contenus externes", desc: "Carte Google Maps du showroom. Google peut déposer des cookies lorsque la carte s'affiche." },
    GA4_ID && { id: "analytics", label: "Mesure d'audience", desc: "Google Analytics : statistiques de visite anonymisées pour améliorer le site." },
    ADS_ID && { id: "ads", label: "Publicité", desc: "Google Ads : mesure de l'efficacité de nos annonces et publicités personnalisées." },
  ].filter(Boolean);

  const read = () => {
    try {
      const c = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!c || c.v !== VERSION || Date.now() - c.t > MAX_AGE) return null;
      return c;
    } catch (e) { return null; }
  };
  let state = read();

  let gtagLoaded = false;
  const apply = (c) => {
    gtag("consent", "update", {
      analytics_storage: c.analytics ? "granted" : "denied",
      ad_storage: c.ads ? "granted" : "denied",
      ad_user_data: c.ads ? "granted" : "denied",
      ad_personalization: c.ads ? "granted" : "denied",
    });
    // les outils Google ne sont chargés qu'après accord
    const ids = [c.analytics && GA4_ID, c.ads && ADS_ID].filter(Boolean);
    if (ids.length && !gtagLoaded) {
      gtagLoaded = true;
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://www.googletagmanager.com/gtag/js?id=" + ids[0];
      document.head.appendChild(s);
      gtag("js", new Date());
      ids.forEach((id) => gtag("config", id, { anonymize_ip: true }));
    }
    loadMedia(!!c.media);
  };

  /* ───── Cartes Google Maps : chargées seulement avec l'accord « Contenus externes » ───── */
  const loadMedia = (ok) => {
    document.querySelectorAll("iframe[data-consent-src]").forEach((f) => {
      const box = f.closest("[data-consent-box]");
      if (ok) {
        if (!f.getAttribute("src")) f.setAttribute("src", f.dataset.consentSrc);
        if (box) box.classList.add("is-granted");
      } else if (box) box.classList.remove("is-granted");
    });
  };

  const save = (choice) => {
    state = { v: VERSION, t: Date.now(), media: !!choice.media, analytics: !!choice.analytics, ads: !!choice.ads };
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* navigation privée : choix gardé pour la page */ }
    apply(state);
    close();
  };
  const all = (v) => Object.fromEntries(CATS.map((c) => [c.id, v]));

  if (state) apply(state);

  /* ───── Bandeau ───── */
  let banner = null;
  const close = () => {
    if (!banner) return;
    banner.classList.remove("is-open");
    document.documentElement.classList.remove("has-cookie-banner");
    setTimeout(() => { if (banner && !banner.classList.contains("is-open")) banner.hidden = true; }, 350);
  };
  const open = (details = false) => {
    if (!banner) build();
    const cur = state || {};
    banner.querySelectorAll("[data-cat]").forEach((i) => (i.checked = !!cur[i.dataset.cat]));
    banner.classList.toggle("is-details", details);
    banner.hidden = false;
    requestAnimationFrame(() => banner.classList.add("is-open"));
    document.documentElement.classList.add("has-cookie-banner");
  };
  const root = () => (window.EMBI_ROOT || "");
  function build() {
    banner = document.createElement("div");
    banner.className = "ck";
    banner.hidden = true;
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Gestion des cookies");
    banner.innerHTML = `
      <div class="ck__inner">
        <p class="ck__title">Cookies&nbsp;: <em>à vous de choisir.</em></p>
        <p class="ck__text">Nous utilisons les cookies nécessaires au fonctionnement du site et, seulement avec votre accord, ceux liés à&nbsp;: ${CATS.map((c) => c.label.toLowerCase()).join(", ")}. Vous pouvez changer d'avis à tout moment via le lien « Gérer les cookies » en bas de page. <a href="${root()}confidentialite.html">Politique de confidentialité</a></p>
        <div class="ck__details" id="ckDetails">
          <label class="ck__cat is-locked"><span><strong>Nécessaires</strong><small>Fonctionnement du site et mémorisation de votre choix. Toujours actifs.</small></span><input type="checkbox" checked disabled /><i aria-hidden="true"></i></label>
          ${CATS.map((c) => `<label class="ck__cat"><span><strong>${c.label}</strong><small>${c.desc}</small></span><input type="checkbox" data-cat="${c.id}" /><i aria-hidden="true"></i></label>`).join("")}
        </div>
        <div class="ck__actions">
          <button type="button" class="ck__btn" data-ck="deny">Tout refuser</button>
          <button type="button" class="ck__btn ck__btn--ghost" data-ck="custom">Personnaliser</button>
          <button type="button" class="ck__btn ck__btn--ghost" data-ck="save">Enregistrer mes choix</button>
          <button type="button" class="ck__btn" data-ck="accept">Tout accepter</button>
        </div>
      </div>`;
    document.body.appendChild(banner);
    banner.addEventListener("click", (e) => {
      const b = e.target.closest("[data-ck]");
      if (!b) return;
      const a = b.dataset.ck;
      if (a === "accept") save(all(true));
      if (a === "deny") save(all(false));
      if (a === "custom") banner.classList.add("is-details");
      if (a === "save") save(Object.fromEntries([...banner.querySelectorAll("[data-cat]")].map((i) => [i.dataset.cat, i.checked])));
    });
  }

  window.EMBICookies = { open: () => open(true) };

  const ready = () => {
    if (!state) open(false);
    else loadMedia(!!state.media);
    document.addEventListener("click", (e) => {
      const l = e.target.closest("[data-cookies]");
      if (l) { e.preventDefault(); open(true); }
      const m = e.target.closest("[data-consent-accept]");
      if (m) save(Object.assign({}, state || all(false), { media: true }));
    });
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", ready) : ready();
})();
