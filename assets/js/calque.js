/* Calque animé (plan de l'architecte / calque de l'architecte d'intérieur), hors page Conception sur mesure */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".csa .calque").forEach((stage) => {
    const range = stage.querySelector("input[type=range]");
    let raf = null;
    const setX = (v) => { stage.style.setProperty("--x", v + "%"); range.value = v; };
    range.addEventListener("input", () => { cancelAnimationFrame(raf); setX(range.value); });
    const run = () => {
      cancelAnimationFrame(raf);
      if (reduce) return setX(45);
      const t0 = performance.now(), dur = 2600;
      const tick = (t) => {
        const k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 3);
        setX(100 - e * 58);
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      setX(100);
      raf = requestAnimationFrame(tick);
    };
    // balayage automatique à l'arrivée à l'écran, puis au doigt / à la souris
    const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { stage.classList.add("go"); run(); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(stage);
  });
})();
