/* « Architecture intérieure » (bloc écrit par scripts/build.js : archiBlock) :
   onglets des chantiers, maquette 3D chargée à l'approche de la section (assets/js/maquette.js),
   tous les plans de l'architecte du chantier choisi, et leur visionneuse (flèches, clavier, glisser). */
const sec = document.getElementById("architecture-interieure");
if (sec) {
  const $ = (s, el = sec) => el.querySelector(s);
  const $$ = (s, el = sec) => [...el.querySelectorAll(s)];
  const mq = $("#aiMq");

  /* ───── Maquette 3D : chargée à l'approche ───── */
  const go = () => import("/assets/js/maquette.js");
  if (!("IntersectionObserver" in window)) go();
  else {
    const io = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) { io.disconnect(); go(); } }, { rootMargin: "900px 0px" });
    io.observe(mq);
  }

  /* ───── Onglets : changer de chantier ───── */
  const tabs = $$("[data-ai-tab]"), panels = $$("[data-ai-panel]");
  tabs.forEach((b) => b.addEventListener("click", () => {
    const id = b.dataset.aiTab;
    if (mq.dataset.maquette === id) return;
    mq.dataset.maquette = id;
    tabs.forEach((t) => t.setAttribute("aria-pressed", t === b));
    panels.forEach((p) => (p.hidden = p.dataset.aiPanel !== id));
    b.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    mq.dispatchEvent(new CustomEvent("maquette:change"));
  }));

  /* ───── Visionneuse des plans du chantier affiché ───── */
  const lb = $("#aiLb"), img = $("#aiLbImg"), count = $("#aiLbCount"), prev = $("#aiLbPrev"), next = $("#aiLbNext"), closeBtn = $("#aiLbClose");
  document.body.append(lb); // hors de la section : la visionneuse passe au-dessus de tout (boutons flottants compris)
  let list = [], cur = 0, from = null;
  const show = (k) => {
    cur = (k + list.length) % list.length;
    const b = list[cur];
    img.src = b.dataset.full;
    img.alt = b.querySelector("img").alt;
    count.textContent = `${cur + 1} / ${list.length} · ${b.querySelector("span").textContent.replace(/^\d+/, "")}`;
    prev.hidden = next.hidden = list.length < 2;
    // le plan suivant se prépare pendant qu'on regarde celui-ci
    if (list.length > 1) new Image().src = list[(cur + 1) % list.length].dataset.full;
  };
  const open = (b) => {
    list = $$(".ai-plan", b.closest("[data-ai-panel]"));
    from = b;
    show(list.indexOf(b));
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  };
  const close = () => { lb.hidden = true; img.removeAttribute("src"); document.body.style.overflow = ""; if (from) from.focus(); };
  sec.addEventListener("click", (e) => { const b = e.target.closest(".ai-plan"); if (b) open(b); });
  closeBtn.addEventListener("click", close);
  prev.addEventListener("click", () => show(cur - 1));
  next.addEventListener("click", () => show(cur + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(cur - 1);
    if (e.key === "ArrowRight") show(cur + 1);
  });
  let tx = null;
  lb.addEventListener("touchstart", (e) => (tx = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    tx = null;
  });
}
