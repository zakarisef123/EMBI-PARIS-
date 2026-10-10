/* Haut de page qui fait défiler des photos de chantiers liées au sujet de la page (toutes les pages intérieures et
   pages chantier) : une photo toutes les 5 s, tirets en bas, photos introuvables retirées, arrêt hors écran,
   désactivé si l'utilisateur demande moins d'animations. */
(() => {
  const fig = document.querySelector("[data-slides]");
  if (!fig) return;
  const dotsBox = fig.parentElement.querySelector(".page-hero__dots") || document.querySelector(".page-hero__dots");
  const all = () => [...fig.querySelectorAll(".page-hero__slide")];
  const dots = () => (dotsBox ? [...dotsBox.querySelectorAll("i")] : []);
  let k = 0;
  // photo introuvable : retirée (avec son tiret) ; s'il n'en reste qu'une, les tirets disparaissent
  all().forEach((im) => {
    const drop = () => {
      const sl = all(), j = sl.indexOf(im);
      if (sl.length < 2 || j < 0) return;
      const wasOn = im.classList.contains("is-on");
      im.remove();
      if (dots()[j]) dots()[j].remove();
      if (wasOn || k >= all().length) show(0);
      if (all().length < 2 && dotsBox) dotsBox.hidden = true;
    };
    im.complete && im.naturalWidth === 0 ? drop() : im.addEventListener("error", drop);
  });
  function show(n) {
    const sl = all(), ds = dots();
    if (!sl.length) return;
    k = (n + sl.length) % sl.length;
    sl.forEach((s, j) => s.classList.toggle("is-on", j === k));
    ds.forEach((d, j) => d.classList.toggle("is-on", j === k));
    const nx = sl[(k + 1) % sl.length];
    if (nx && nx.loading === "lazy") nx.loading = "eager"; // la suivante se charge à l'avance
  }
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (all()[1]) all()[1].loading = "eager";
  let inView = true;
  new IntersectionObserver((en) => (inView = en[0].isIntersecting)).observe(fig);
  setInterval(() => {
    if (!inView || document.hidden) return;
    const sl = all(), nx = sl[(k + 1) % sl.length];
    if (sl.length > 1 && nx.complete && nx.naturalWidth) show(k + 1);
  }, 5000);
})();
