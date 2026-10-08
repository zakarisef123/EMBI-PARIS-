/* Carte « Autour du showroom » (page Showroom).
   Adaptation du module « Neighborhood Discovery » de Google Maps fourni par EMBI, réécrit avec les services
   actuels de Google (Places API (New) et Routes API), seuls ouverts aux comptes créés depuis mars 2025 : recherche de lieux,
   temps de marche et itinéraire depuis le showroom, coordonnées, horaires, photos et avis.
   En français, aux couleurs du site, sans bibliothèque externe.
   Google Maps n'est chargé qu'avec l'accord « Contenus externes » du bandeau cookies (consent.js),
   et seulement quand la carte approche de l'écran (chaque chargement est décompté par Google). */
(() => {
  const box = document.querySelector("[data-nd]");
  if (!box) return;
  const CFG = window.EMBI_MAPS || {};
  const CENTER = CFG.center || { lat: 48.8794777, lng: 2.2933696 };
  const RADIUS = 1500;         // rayon de recherche autour du showroom (m)
  const PAGE = 5;              // lieux affichés, puis « Voir plus »
  const MAX_PHOTOS = 6;
  const POI_ZOOM = 18;         // les pictos Google des commerces n'apparaissent qu'à partir de ce zoom
  const MAPS_LINK = "https://www.google.com/maps/search/?api=1&query=5+rue+Villebois-Mareuil+75017+Paris";

  const $ = (s, el = box) => el.querySelector(s);
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const svg = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
  const ICON = {
    star: svg("M12 17.3 18.2 21l-1.6-7L22 9.2l-7.2-.6L12 2 9.2 8.6 2 9.2 7.4 14l-1.6 7z"),
    half: svg("M22 9.2l-7.2-.6L12 2 9.2 8.6 2 9.2 7.4 14l-1.6 7L12 17.3 18.2 21l-1.6-7L22 9.2zM12 15.4V6.1l1.7 4 4.4.4-3.3 2.9 1 4.3-3.8-2.3z"),
    empty: svg("M22 9.2l-7.2-.6L12 2 9.2 8.6 2 9.2 7.4 14l-1.6 7L12 17.3 18.2 21l-1.6-7L22 9.2zm-10 6.2-3.8 2.3 1-4.3-3.3-2.9 4.4-.4L12 6.1l1.7 4 4.4.4-3.3 2.9 1 4.3z"),
    place: svg("M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"),
    web: svg("M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 6h-2.9a15.7 15.7 0 0 0-1.4-3.6A8 8 0 0 1 18.9 8zM12 4c.8 1.2 1.5 2.5 1.9 4h-3.8c.4-1.4 1.1-2.8 1.9-4zM4.3 14a8.2 8.2 0 0 1 0-4h3.4a16.5 16.5 0 0 0 0 4H4.3zm.8 2h2.9c.3 1.3.8 2.5 1.4 3.6A8 8 0 0 1 5.1 16zM8 8H5.1a8 8 0 0 1 4.3-3.6C8.8 5.5 8.4 6.7 8 8zm4 12c-.8-1.2-1.5-2.5-1.9-4h3.8c-.4 1.5-1.1 2.8-1.9 4zm2.3-6H9.7a14.7 14.7 0 0 1 0-4h4.6a14.7 14.7 0 0 1 0 4zm.3 5.6c.6-1.1 1.1-2.3 1.4-3.6h2.9a8 8 0 0 1-4.3 3.6zm1.8-5.6a16.5 16.5 0 0 0 0-4h3.4a8.2 8.2 0 0 1 0 4h-3.4z"),
    phone: svg("M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"),
    clock: svg("M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7z"),
    walk: svg("M13.5 5.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM9.8 8.9 7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3A7.3 7.3 0 0 0 19 13v-2a5 5 0 0 1-4.3-2.4l-1-1.6a2 2 0 0 0-1.7-1c-.3 0-.5 0-.8.1L6 8.3V13h2V9.6l1.8-.7"),
    back: svg("M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z"),
  };
  const stars = (rating) => {
    const ten = Math.round(2 * rating), full = Math.floor(ten / 2), half = ten % 2;
    return ICON.star.repeat(full) + ICON.half.repeat(half) + ICON.empty.repeat(5 - full - half);
  };
  const PRICE = { FREE: "Gratuit", INEXPENSIVE: "€", MODERATE: "€€", EXPENSIVE: "€€€", VERY_EXPENSIVE: "€€€€" };
  // « lundi: 09:00 – 18:00 » → jours consécutifs aux mêmes horaires regroupés (« lun - ven »)
  const parseHours = (lines) => {
    const rows = (lines || []).map((e) => e.split(/:\s+/)).map((e) => ({ days: e[0].slice(0, 3), hours: e.slice(1).join(": ") }));
    for (let i = 1; i < rows.length; i++) {
      if (rows[i - 1].hours === rows[i].hours) {
        rows[i - 1].days = rows[i - 1].days.includes(" - ") ? rows[i - 1].days.replace(/[^ ]+$/, rows[i].days) : rows[i - 1].days + " - " + rows[i].days;
        rows.splice(i--, 1);
      }
    }
    return rows;
  };

  /* ───── Repli : plan d'accès simple (pas de clé, clé refusée ou Google indisponible) ───── */
  let fellBack = false;
  const fallback = () => {
    if (fellBack) return;
    fellBack = true;
    box.classList.add("nd--fallback");
    $(".nd__map").innerHTML = '<iframe title="Plan d\'accès au showroom EMBI, 5 rue Villebois-Mareuil, Paris 17e" src="https://www.google.com/maps?q=5+rue+Villebois-Mareuil,+75017+Paris&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>';
  };

  /* ───── Chargement : accord cookies + carte proche de l'écran ───── */
  let consent = !!window.EMBI_MEDIA_OK, near = false, started = false;
  const start = () => {
    if (started || !consent || !near) return;
    started = true;
    box.classList.add("is-granted");
    if (!CFG.key) return fallback();
    window.gm_authFailure = fallback; // clé refusée par Google (adresse du site non autorisée, API non activée…)
    window.EMBI_ndInit = () => init().catch((e) => { console.error(e); fallback(); });
    const s = document.createElement("script");
    s.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(CFG.key) +
      "&callback=EMBI_ndInit&libraries=places,routes&language=fr&region=FR&loading=async&solution_channel=GMP_QB_neighborhooddiscovery_v3_cABCDEF";
    s.async = true;
    s.onerror = fallback;
    document.head.appendChild(s);
  };
  document.addEventListener("embi:media", (e) => { consent = !!e.detail; if (consent) box.classList.add("is-granted"); start(); });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((en) => { if (en.some((x) => x.isIntersecting)) { near = true; io.disconnect(); start(); } }, { rootMargin: "600px 0px" });
    io.observe(box);
  } else { near = true; }
  start();

  /* ───── Le module ───── */
  async function init() {
    const g = google.maps;
    const places = await g.importLibrary("places");
    const routes = await g.importLibrary("routes").catch(() => null);
    const mapEl = $(".nd__map"), details = $(".nd__details"), list = $(".nd__results"),
      more = $(".nd__more"), hint = $(".nd__hint"), photoBox = $(".nd__photo");

    const bounds = new g.Circle({ center: CENTER, radius: RADIUS }).getBounds();
    const map = new g.Map(mapEl, {
      center: CENTER, zoom: 16, maxZoom: 20, restriction: { latLngBounds: bounds },
      fullscreenControl: true, mapTypeControl: false, streetViewControl: false, zoomControl: true,
      gestureHandling: "cooperative", // sur mobile, un doigt fait défiler la page, deux doigts déplacent la carte
    });
    const poiStyle = () => map.setOptions({ styles: [{ featureType: "poi", elementType: map.getZoom() < POI_ZOOM ? "labels" : "labels.text", stylers: [{ visibility: "off" }] }] });
    map.addListener("zoom_changed", poiStyle);
    poiStyle();
    // clic sur un picto Google (commerce, station…) : on affiche sa fiche dans le module
    map.addListener("click", (e) => { if (e.placeId) { e.stop(); select(e.placeId); } });

    const PIN = "M13 0C5.817 0 0 5.93 0 13.267c0 7.862 5.59 10.81 9.555 17.624C12.09 35.248 11.342 38 13 38c1.723 0 .975-2.817 3.445-7.043C20.085 24.503 26 21.162 26 13.267 26 5.93 20.183 0 13 0Z";
    const pin = (title, position, fill, stroke, label, z) => new g.Marker({
      title, position, map, zIndex: z,
      icon: { path: PIN, fillColor: fill, fillOpacity: 1, strokeColor: stroke, strokeWeight: 1.5, anchor: new g.Point(13, 38), labelOrigin: new g.Point(13, 13) },
      label: label ? { text: label, color: "#f7f4ee", fontSize: "12px", fontWeight: "700", fontFamily: "Jost, system-ui, sans-serif" } : null,
    });
    pin("Showroom EMBI, 5 rue Villebois-Mareuil", CENTER, "#14233f", "#c8b48f", "E", 1000);
    const selectedPin = new g.Marker({ title: "Lieu choisi", zIndex: 600 });

    /* fiches des lieux : un objet Place par lieu, complété au fil des demandes (chaque champ n'est payé qu'une fois) */
    const LIST_FIELDS = ["displayName", "location", "photos", "rating", "userRatingCount", "priceLevel", "primaryTypeDisplayName"];
    const DETAIL_FIELDS = [...LIST_FIELDS, "formattedAddress", "googleMapsURI", "websiteURI", "nationalPhoneNumber", "internationalPhoneNumber", "regularOpeningHours", "reviews", "attributions"];
    const cache = new Map();
    const entry = (id, placeObj) => {
      if (!cache.has(id)) cache.set(id, { placeId: id, place: placeObj || new places.Place({ id, requestedLanguage: "fr", requestedRegion: "fr" }), got: new Set() });
      return cache.get(id);
    };
    const read = (pl, k) => { try { return pl[k]; } catch (e) { return undefined; } };
    const absorb = (p, fields) => {
      const pl = p.place;
      fields.forEach((f) => p.got.add(f));
      p.name = read(pl, "displayName") || p.name || "";
      p.coords = read(pl, "location") || p.coords;
      p.type = read(pl, "primaryTypeDisplayName") || p.type;
      p.rating = read(pl, "rating") || p.rating;
      p.reviewsCount = read(pl, "userRatingCount") || p.reviewsCount;
      p.price = PRICE[read(pl, "priceLevel")] || p.price;
      const photos = read(pl, "photos");
      if (photos && photos.length) p.photos = photos.slice(0, MAX_PHOTOS).map((ph) => ({
        small: ph.getURI({ maxWidth: 240, maxHeight: 240 }),
        large: ph.getURI({ maxWidth: 1200, maxHeight: 1200 }),
        attrs: (ph.authorAttributions || []).map((a) => (a.uri ? `<a href="${esc(a.uri)}" target="_blank" rel="noopener">${esc(a.displayName)}</a>` : esc(a.displayName))),
      }));
      p.address = read(pl, "formattedAddress") || p.address;
      p.url = read(pl, "googleMapsURI") || p.url;
      const web = read(pl, "websiteURI");
      if (web) { p.website = web; try { p.domain = new URL(web).hostname.replace(/^www\./, ""); } catch (e) { p.domain = web; } }
      const phone = read(pl, "nationalPhoneNumber");
      if (phone) { p.phone = phone; p.tel = read(pl, "internationalPhoneNumber") || phone; }
      const oh = read(pl, "regularOpeningHours");
      if (oh && oh.weekdayDescriptions) p.hours = parseHours(oh.weekdayDescriptions);
      const rv = read(pl, "reviews");
      if (rv && rv.length) p.reviews = rv.map((r) => ({ name: (r.authorAttribution && r.authorAttribution.displayName) || "", uri: r.authorAttribution && r.authorAttribution.uri, photo: r.authorAttribution && r.authorAttribution.photoURI, rating: r.rating, when: r.relativePublishTimeDescription, text: r.text }));
      const at = read(pl, "attributions");
      if (at && at.length) p.attributions = at.map((a) => (a.providerURI ? `<a href="${esc(a.providerURI)}" target="_blank" rel="noopener">${esc(a.provider)}</a>` : esc(a.provider)));
      return p;
    };
    const fetchDetails = async (id) => {
      const p = entry(id);
      const missing = DETAIL_FIELDS.filter((f) => !p.got.has(f));
      if (missing.length) { await p.place.fetchFields({ fields: missing }); absorb(p, missing); }
      return p;
    };

    /* ───── Liste de lieux (catégories) ───── */
    let shown = [], all = [], listPins = [];
    const clearList = () => { listPins.forEach((m) => m.setMap(null)); listPins = []; shown = []; all = []; list.innerHTML = ""; more.hidden = true; };
    const itemHTML = (p) => `<li class="nd__item">
        <button type="button" class="nd__pick" data-id="${esc(p.placeId)}">
          <span class="nd__name">${esc(p.name)}</span>
          <span class="nd__meta">${p.rating ? `<span class="nd__stars">${esc(p.rating.toFixed(1))} ${ICON.star}</span>` : ""}${p.reviewsCount ? `<span>(${esc(p.reviewsCount)})</span>` : ""}${p.price ? `<span>· ${esc(p.price)}</span>` : ""}</span>
          ${p.type ? `<span class="nd__meta">${esc(p.type)}</span>` : ""}
        </button>
        ${p.photos ? `<button type="button" class="nd__thumb" data-photo="${esc(p.placeId)}" aria-label="Voir la photo : ${esc(p.name)}"><img src="${esc(p.photos[0].small)}" alt="" loading="lazy" /></button>` : ""}
      </li>`;
    const showMore = () => {
      all.slice(shown.length, shown.length + PAGE).forEach((p) => {
        shown.push(p);
        list.insertAdjacentHTML("beforeend", itemHTML(p));
        if (p.coords) {
          const m = pin(p.name, p.coords, "#c8b48f", "#14233f", "", 500);
          m.addListener("click", () => select(p.placeId));
          listPins.push(m);
        }
      });
      more.hidden = shown.length >= all.length;
      // la carte englobe le showroom et les lieux affichés
      const b = new g.LatLngBounds(CENTER);
      shown.forEach((p) => p.coords && b.extend(p.coords));
      if (shown.length) map.fitBounds(b, 60);
    };
    const chips = [...box.querySelectorAll("[data-nd-type]")];
    chips.forEach((chip) => chip.setAttribute("aria-pressed", "false"));
    let searchId = 0;
    const loadType = async (type, chip) => {
      const my = ++searchId;
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      closeDetails();
      clearList();
      hint.hidden = false;
      hint.textContent = "Recherche en cours…";
      try {
        const { places: found } = await places.Place.searchNearby({
          fields: ["id", ...LIST_FIELDS], locationRestriction: { center: CENTER, radius: RADIUS },
          includedPrimaryTypes: [type], maxResultCount: 20, rankPreference: "DISTANCE", language: "fr", region: "fr",
        });
        if (my !== searchId) return; // une autre catégorie a été choisie entre-temps
        if (!found || !found.length) { hint.textContent = "Aucun lieu de ce type à proximité."; return; }
        hint.hidden = true;
        all = found.map((pl) => absorb(entry(pl.id, pl), LIST_FIELDS));
        showMore();
      } catch (e) {
        console.error(e);
        if (my === searchId) hint.textContent = "La recherche n'est pas disponible pour le moment.";
      }
    };
    chips.forEach((chip) => chip.addEventListener("click", () => loadType(chip.dataset.ndType, chip)));
    more.addEventListener("click", showMore);
    list.addEventListener("click", (e) => {
      const ph = e.target.closest("[data-photo]");
      if (ph) { const p = cache.get(ph.dataset.photo); if (p && p.photos) openPhoto(p.photos[0], p.name, ph); return; }
      const b = e.target.closest(".nd__pick");
      if (b) select(b.dataset.id, true);
    });

    /* ───── Fiche d'un lieu ───── */
    let current = null, lastFocus = null, routeLines = [];
    const detailsHTML = (p) => `
      <button type="button" class="nd__back">${ICON.back}<span>Retour</span></button>
      <h3 class="nd__dname">${esc(p.name)}</h3>
      <p class="nd__meta">
        ${p.rating ? `<span class="nd__stars">${esc(p.rating.toFixed(1))} ${stars(p.rating)}</span>` : ""}
        ${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">${p.reviewsCount ? `${esc(p.reviewsCount)} avis` : "Voir sur Google Maps"} ↗</a>` : ""}
        ${p.price ? `<span>· ${esc(p.price)}</span>` : ""}
      </p>
      ${p.type ? `<p class="nd__meta">${esc(p.type)}</p>` : ""}
      <p class="nd__walk"${p.duration ? "" : " hidden"}>${ICON.walk}<span>${esc(p.duration || "")} à pied depuis le showroom</span></p>
      <ul class="nd__contact">
        ${p.address ? `<li>${ICON.place}<span>${esc(p.address)}</span></li>` : ""}
        ${p.website ? `<li>${ICON.web}<a href="${esc(p.website)}" target="_blank" rel="noopener">${esc(p.domain)}</a></li>` : ""}
        ${p.phone ? `<li>${ICON.phone}<a href="tel:${esc(String(p.tel).replace(/[^\d+]/g, ""))}">${esc(p.phone)}</a></li>` : ""}
        ${p.hours ? `<li>${ICON.clock}<span class="nd__hours">${p.hours.map((h) => `<span><b>${esc(h.days)}</b> ${esc(h.hours)}</span>`).join("")}</span></li>` : ""}
      </ul>
      ${p.photos ? `<div class="nd__photos">${p.photos.map((ph, i) => `<button type="button" class="nd__thumb" data-k="${i}" aria-label="Agrandir la photo ${i + 1}"><img src="${esc(ph.small)}" alt="" loading="lazy" /></button>`).join("")}</div>` : ""}
      ${p.reviews ? `<div class="nd__reviews"><p class="nd__attr">Avis des utilisateurs Google</p>${p.reviews.map((r) => `
        <div class="nd__review">
          <p class="nd__who">${r.photo ? `<img class="nd__avatar" src="${esc(r.photo)}" alt="" loading="lazy" />` : ""}${r.uri ? `<a href="${esc(r.uri)}" target="_blank" rel="noopener">${esc(r.name)}</a>` : esc(r.name)}</p>
          <p class="nd__meta">${r.rating ? `<span class="nd__stars">${stars(r.rating)}</span>` : ""}<span>${esc(r.when || "")}</span></p>
          ${r.text ? `<p class="nd__rtext">${esc(r.text)}</p>` : ""}
        </div>`).join("")}</div>` : ""}
      ${p.attributions ? `<p class="nd__attr">${p.attributions.join(" · ")}</p>` : ""}`;
    const renderDetails = (p, focus) => {
      if (current !== p.placeId) return;
      const st = details.scrollTop;
      details.innerHTML = detailsHTML(p);
      details.scrollTop = focus ? 0 : st;
      details.hidden = false;
      box.classList.add("nd--details");
      if (focus) $(".nd__back", details).focus({ preventScroll: true });
    };
    const clearRoute = () => { routeLines.forEach((l) => l.setMap(null)); routeLines = []; };
    async function select(id, pan) {
      if (!id || id === current) return;
      current = id;
      if (!box.classList.contains("nd--details")) lastFocus = document.activeElement;
      clearRoute();
      let p;
      try { p = await fetchDetails(id); } catch (e) { console.error(e); if (current === id) current = null; return; }
      if (current !== id) return;
      if (listPins.some((m) => m.getTitle() === p.name)) selectedPin.setMap(null);
      else if (p.coords) { selectedPin.setPosition(p.coords); selectedPin.setMap(map); }
      if (pan && p.coords) map.panTo(p.coords);
      renderDetails(p, true);
      walk(p);
    }
    function closeDetails() {
      if (!current) return;
      current = null;
      details.hidden = true;
      details.innerHTML = "";
      box.classList.remove("nd--details");
      clearRoute();
      selectedPin.setMap(null);
      if (lastFocus && box.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    }
    details.addEventListener("click", (e) => {
      if (e.target.closest(".nd__back")) return closeDetails();
      const t = e.target.closest(".nd__thumb[data-k]");
      if (t) { const p = cache.get(current); if (p && p.photos) openPhoto(p.photos[+t.dataset.k], p.name, t); }
    });

    /* temps de marche et itinéraire à pied depuis le showroom (Routes API) */
    const walk = async (p) => {
      if (!routes || !p.coords) return;
      try {
        if (!p.route) {
          const { routes: found } = await routes.Route.computeRoutes({ origin: CENTER, destination: p.coords, travelMode: "WALKING", fields: ["durationMillis", "localizedValues", "path"], language: "fr", region: "fr" });
          if (!found || !found.length) return;
          p.route = found[0];
          const lv = p.route.localizedValues;
          p.duration = (lv && lv.duration) || (p.route.durationMillis ? Math.max(1, Math.round(p.route.durationMillis / 60000)) + " min" : "");
        }
        if (current !== p.placeId) return;
        clearRoute();
        routeLines = p.route.createPolylines({ polylineOptions: { strokeColor: "#233e6b", strokeWeight: 5, strokeOpacity: 0.85 } });
        routeLines.forEach((l) => l.setMap(map));
        // seule la ligne du temps de marche change : la fiche (et le focus clavier) reste en place
        const w = $(".nd__walk", details);
        if (p.duration && w) { $("span", w).textContent = p.duration + " à pied depuis le showroom"; w.hidden = false; }
      } catch (e) { console.error(e); }
    };

    /* ───── Recherche libre (dans un rayon de 1,5 km) ───── */
    const searchBox = $(".nd__search");
    const pac = new places.PlaceAutocompleteElement({ locationRestriction: bounds, includedRegionCodes: ["fr"], placeholder: "Rechercher un lieu à proximité" });
    pac.setAttribute("aria-label", "Rechercher un lieu près du showroom");
    pac.className = "nd__pac";
    searchBox.replaceChildren(pac);
    pac.addEventListener("gmp-select", (e) => {
      const pl = e.placePrediction && e.placePrediction.toPlace();
      if (!pl || !pl.id) return;
      entry(pl.id, pl);
      if (current === pl.id) current = null;
      select(pl.id, true);
    });

    /* ───── Photo en grand ───── */
    let photoFrom = null;
    const openPhoto = (ph, name, from) => {
      photoFrom = from;
      const img = $("img", photoBox);
      img.src = ph.large;
      img.alt = name ? `Photo : ${name}` : "Photo du lieu";
      $(".nd__photo-attrs", photoBox).innerHTML = ph.attrs.length ? "Photo : " + ph.attrs.join(", ") : "";
      photoBox.hidden = false;
      $(".nd__photo-close", photoBox).focus({ preventScroll: true });
    };
    const closePhoto = () => {
      if (photoBox.hidden) return;
      photoBox.hidden = true;
      $("img", photoBox).removeAttribute("src");
      if (photoFrom && photoFrom.isConnected) photoFrom.focus({ preventScroll: true });
    };
    $(".nd__photo-close", photoBox).addEventListener("click", closePhoto);
    photoBox.addEventListener("click", (e) => { if (e.target === photoBox) closePhoto(); });
    box.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (!photoBox.hidden) { e.stopPropagation(); closePhoto(); }
      else if (current) { e.stopPropagation(); closeDetails(); }
    });
    box.classList.add("nd--ready");
  }
})();
