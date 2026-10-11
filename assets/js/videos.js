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
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) play(e.target);
    else if (!e.target.paused) e.target.pause();
  }), { threshold: 0.25 });
  vids.forEach((v) => io.observe(v));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) vids.forEach((v) => !v.paused && v.pause());
  });
})();
