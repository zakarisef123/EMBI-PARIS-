/* Vidéos des chantiers (fabriquées par scripts/videos à partir des photos de chaque chantier, sans son) :
   en-tête de la page chantier (16:9 sur écran large, verticale sur téléphone) et miniatures des listes.
   Une vidéo ne se charge que lorsqu'elle est visible et se met en pause hors écran ; elle apparaît en fondu
   au-dessus de la photo dès qu'elle joue. Rien n'est chargé si l'utilisateur demande moins d'animations
   ou économise ses données : les photos restent affichées. */
(() => {
  const vids = [...document.querySelectorAll("video.pj-hero__video, video[data-video]")];
  if (!vids.length || !("IntersectionObserver" in window)) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (navigator.connection && navigator.connection.saveData) return;

  const play = (v) => {
    if (!v.getAttribute("src")) v.src = v._src();
    v.muted = true;
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  };
  vids.forEach((v) => {
    if (v.classList.contains("pj-hero__video")) {
      // en-tête : le format suit la forme du haut de page (large → 16:9, haut → vertical)
      const box = v.parentElement;
      v._src = () => (box.clientWidth >= box.clientHeight ? v.dataset.videoWide : v.dataset.videoTall);
    } else v._src = () => v.dataset.video;
    v.addEventListener("playing", () => v.classList.add("is-on"));
    v.addEventListener("error", () => v.remove());
  });
  // carrousel « Nos chantiers » des pages secteur : seule la vidéo du chantier affiché joue, depuis le début,
  // et le carrousel passe au chantier suivant quand elle se termine (assets/js/main.js, événement « phare:fin »)
  const slideOf = (v) => v.closest(".phare__slide");
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    const v = e.target, sl = slideOf(v);
    v._seen = e.isIntersecting;
    if (e.isIntersecting && (!sl || sl.classList.contains("is-on"))) play(v);
    else if (!v.paused) v.pause();
  }), { threshold: 0.25 });
  vids.forEach((v) => {
    io.observe(v);
    const sl = slideOf(v);
    if (!sl) return;
    v.addEventListener("ended", () => v.dispatchEvent(new CustomEvent("phare:fin", { bubbles: true })));
    new MutationObserver(() => {
      if (sl.classList.contains("is-on")) { if (v._seen) { if (v.getAttribute("src")) v.currentTime = 0; play(v); } }
      else if (!v.paused) v.pause();
    }).observe(sl, { attributes: true, attributeFilter: ["class"] });
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) vids.forEach((v) => !v.paused && v.pause());
  });
})();
