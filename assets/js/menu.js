/*
 * Menu « Réalisations » (en haut de toutes les pages) : liste des chantiers
 * par catégorie, avec aperçu photo au survol. Généré depuis projects.js.
 */
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
      return `<div class="mega__col"><p class="mega__cat">${plural[c] || cats[c]} <sup>${items.length}</sup></p><ul>${items
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
  toggle.addEventListener("click", () => set(!wrap.classList.contains("is-open")));
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
