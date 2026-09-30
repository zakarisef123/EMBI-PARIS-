/* Appels à l'action flottants (toutes les pages) :
   barre « Appeler / Devis gratuit » en bas d'écran sur mobile, boutons flottants sur ordinateur.
   Masqués en haut de page, quand le formulaire de contact ou le pied de page est visible, et quand le menu est ouvert. */
(() => {
  const onContact = !!document.getElementById("form");
  const devisHref = () => {
    const type = document.body.dataset.ctaType || "";
    return onContact ? "#contact" : `${window.EMBI_ROOT || ""}contact.html${type ? `?type=${type}` : ""}`;
  };
  const bar = document.createElement("div");
  bar.className = "fab";
  bar.innerHTML = `
    <a class="fab__tel" href="tel:+33145726524" aria-label="Appeler EMBI au 01 45 72 65 24">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>
      <span>Appeler</span>
    </a>
    <a class="fab__devis" href="${devisHref()}">Devis gratuit <span aria-hidden="true">→</span></a>`;
  document.body.appendChild(bar);
  const devis = bar.querySelector(".fab__devis");

  let blocked = 0;
  const watch = [document.getElementById("contact"), document.querySelector(".footer")].filter(Boolean);
  const seen = new Set();
  const io = new IntersectionObserver((en) => {
    en.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
    blocked = seen.size;
    update();
  }, { threshold: 0.05 });
  watch.forEach((el) => io.observe(el));

  const nav = document.getElementById("nav");
  function update() {
    const show = scrollY > innerHeight * 0.6 && !blocked && !(nav && nav.classList.contains("is-open"));
    if (show) devis.setAttribute("href", devisHref());
    bar.classList.toggle("is-on", show);
  }
  addEventListener("scroll", update, { passive: true });
  if (nav) new MutationObserver(update).observe(nav, { attributes: true, attributeFilter: ["class"] });
  update();
})();
