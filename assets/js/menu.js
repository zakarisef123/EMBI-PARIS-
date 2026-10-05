/*
 * Menu « Réalisations » (en haut de toutes les pages) : liste des chantiers
 * par catégorie, avec aperçu photo au survol. Généré depuis projects.js.
 */
/* Verrou du défilement quand le menu mobile est ouvert.
   Sur iPhone, overflow: hidden ne bloque pas la page : on la fige (position fixed) puis on la remet
   exactement où elle était. La classe « menu-open » fige aussi l'apparence de l'en-tête. */
window.EMBI_MENU_LOCK = (() => {
  let y = 0, locked = false;
  return (open) => {
    if (open === locked) return;
    locked = open;
    const b = document.body;
    b.classList.toggle("menu-open", open);
    document.documentElement.classList.toggle("menu-open", open);
    if (open) {
      y = window.scrollY;
      b.style.position = "fixed";
      b.style.top = `-${y}px`;
      b.style.left = "0";
      b.style.right = "0";
      b.style.overflow = "hidden";
    } else {
      b.style.position = b.style.top = b.style.left = b.style.right = b.style.overflow = "";
      window.scrollTo({ top: y, behavior: "instant" });
    }
  };
})();
// passage en affichage ordinateur (rotation de tablette…) avec le menu mobile ouvert : on le referme proprement
addEventListener("resize", () => {
  const burger = document.getElementById("burger");
  if (innerWidth > 1180 && document.body.classList.contains("menu-open") && burger) burger.click();
});

(() => {
  const projects = window.EMBI_PROJECTS || [];
  const cats = window.EMBI_CATEGORIES || {};
  const trigger = document.querySelector("[data-mega]");
  if (!trigger || !projects.length) return;
  const esc = (s = "") => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const url = window.EMBI_PROJECT_URL;
  const current = document.body.dataset.project;
  const plural = { hotel: "Hôtels", boutique: "Boutiques", restaurant: "Restaurants", particulier: "Particuliers" };

  const cols = Object.keys(cats)
    .map((c) => {
      const items = projects.filter((p) => p.category === c);
      if (!items.length) return "";
      const sector = (window.EMBI_SECTORS || {})[c];
      const head = `${plural[c] || cats[c]} <sup>${items.length}</sup>`;
      return `<div class="mega__col"><p class="mega__cat">${sector ? `<a href="${sector}">${head}</a>` : head}</p><ul>${items
        .map((p) => `<li><a href="${url(p.id)}" data-img="${esc(p.images[0])}"${p.id === current ? ' aria-current="page"' : ""}>${esc(p.title)}</a></li>`)
        .join("")}</ul></div>`;
    })
    .join("");

  const wrap = document.createElement("div");
  wrap.className = "mega-wrap";
  trigger.replaceWith(wrap);
  wrap.innerHTML = `
    <button type="button" class="mega__toggle" aria-expanded="false" aria-controls="mega">Réalisations <span aria-hidden="true">▾</span></button>
    <div class="mega" id="mega">
      <div class="mega__inner">
        <a class="mega__all mega__all--mobile" href="${trigger.getAttribute("href")}">Voir toutes les réalisations <span aria-hidden="true">→</span></a>
        <div class="mega__cols">${cols}</div>
        <div class="mega__side">
          <div class="mega__preview"><img alt="" /></div>
          <a class="mega__all" href="${trigger.getAttribute("href")}">Voir toutes les réalisations <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </div>`;

  const toggle = wrap.querySelector(".mega__toggle");
  const mega = wrap.querySelector(".mega");
  const img = wrap.querySelector(".mega__preview img");
  const first = wrap.querySelector("[data-img]");
  if (first) img.src = first.dataset.img;
  const hover = matchMedia("(hover: hover) and (pointer: fine)");
  let t = null;
  const set = (open) => {
    wrap.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };
  toggle.addEventListener("click", (e) => {
    // souris : le survol ouvre déjà le menu, un clic sur « Réalisations » mène donc à la page des réalisations
    // (sinon le clic refermait le menu que le survol venait d'ouvrir). Clavier et écran tactile : ouvre / ferme.
    if (hover.matches && e.detail > 0) { location.href = trigger.getAttribute("href"); return; }
    set(!wrap.classList.contains("is-open"));
  });
  wrap.addEventListener("mouseenter", () => { if (hover.matches) { clearTimeout(t); set(true); } });
  wrap.addEventListener("mouseleave", () => { if (hover.matches) t = setTimeout(() => set(false), 180); });
  mega.addEventListener("mouseover", (e) => {
    const a = e.target.closest("[data-img]");
    if (a && img.getAttribute("src") !== a.dataset.img) img.src = a.dataset.img;
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) set(false); });
  // un lien choisi ferme le menu (et le menu mobile)
  mega.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
})();
