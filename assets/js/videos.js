/* Vidéos des chantiers (fabriquées par scripts/videos à partir des photos de chaque chantier, sans son).
   - En-tête de la page chantier : 16:9 sur un haut de page large, verticale sur téléphone ; joue dès qu'il est visible.
   - Carrousel « Nos chantiers » des pages secteur : seule la vidéo du chantier affiché joue, depuis le début ; le
     carrousel passe au suivant quand elle se termine (assets/js/main.js, événement « phare:fin »).
   - Miniatures des listes : la photo reste fixe ; sur ordinateur la vidéo joue au survol de la carte, sur téléphone
     seule la carte la plus proche du milieu de l'écran s'anime.
   Une vidéo ne se charge qu'au moment où elle doit jouer et apparaît en fondu sur la photo. Rien n'est chargé si
   le visiteur demande moins d'animations ou économise ses données : les photos restent affichées. */
(() => {
  const all = [...document.querySelectorAll("video.pj-hero__video, video[data-video]")];
  if (!all.length || !("IntersectionObserver" in window)) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (navigator.connection && navigator.connection.saveData) return;

  const play = (v, fromStart) => {
    const src = v._src();
    if (!src) return;
    if (!v.getAttribute("src")) v.src = src;
    else if (fromStart) v.currentTime = 0;
    v.muted = true;
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  };
  const stop = (v, hide) => {
    if (!v.paused) v.pause();
    if (hide) v.classList.remove("is-on"); // retour à la photo
  };
  all.forEach((v) => {
    if (v.classList.contains("pj-hero__video")) {
      const box = v.parentElement; // le format suit la forme du haut de page
      v._src = () => (box.clientWidth >= box.clientHeight ? v.dataset.videoWide : v.dataset.videoTall) || "";
    } else v._src = () => v.dataset.video;
    v.addEventListener("playing", () => v.classList.add("is-on"));
    v.addEventListener("error", () => v.remove());
  });

  const heroes = all.filter((v) => v.classList.contains("pj-hero__video"));
  const phares = all.filter((v) => v.closest(".phare__slide"));
  const cards = all.filter((v) => !heroes.includes(v) && !phares.includes(v));

  // en-tête et carrousel : lecture quand c'est visible
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    const v = e.target, sl = v.closest(".phare__slide");
    v._seen = e.isIntersecting;
    if (e.isIntersecting && (!sl || sl.classList.contains("is-on"))) play(v);
    else stop(v);
  }), { threshold: 0.25 });
  heroes.concat(phares).forEach((v) => io.observe(v));
  phares.forEach((v) => {
    const sl = v.closest(".phare__slide");
    v.addEventListener("ended", () => v.dispatchEvent(new CustomEvent("phare:fin", { bubbles: true })));
    new MutationObserver(() => {
      if (sl.classList.contains("is-on")) { if (v._seen) play(v, true); }
      else stop(v);
    }).observe(sl, { attributes: true, attributeFilter: ["class"] });
  });

  // miniatures
  if (cards.length) {
    cards.forEach((v) => { v.loop = true; });
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      cards.forEach((v) => {
        const card = v.closest("a") || v.parentElement;
        card.addEventListener("mouseenter", () => play(v));
        card.addEventListener("mouseleave", () => stop(v, true));
        card.addEventListener("focus", () => play(v));
        card.addEventListener("blur", () => stop(v, true));
      });
    } else {
      // écran tactile : une seule miniature animée, la plus proche du milieu de l'écran
      const seen = new Set();
      let current = null, raf = 0;
      const pick = () => {
        raf = 0;
        const cx = innerWidth / 2, cy = innerHeight / 2;
        let best = null, bestD = Infinity;
        seen.forEach((v) => {
          const r = v.getBoundingClientRect();
          const d = Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy);
          if (d < bestD) { bestD = d; best = v; }
        });
        if (best === current) return;
        if (current) stop(current, true);
        current = best;
        if (current) play(current);
      };
      const later = () => { if (!raf) raf = requestAnimationFrame(pick); };
      const ioc = new IntersectionObserver((entries) => {
        entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
        later();
      }, { threshold: 0.6 });
      cards.forEach((v) => ioc.observe(v));
      addEventListener("scroll", later, { passive: true });
      document.querySelectorAll("[data-rail]").forEach((r) => r.addEventListener("scroll", later, { passive: true }));
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) all.forEach((v) => stop(v));
  });
})();
