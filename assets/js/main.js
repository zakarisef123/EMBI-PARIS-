(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const projects = window.EMBI_PROJECTS || [];
  const cats = window.EMBI_CATEGORIES || {};
  const pad = (n) => String(n).padStart(2, "0");
  const esc = (str = "") =>
    str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  /* ───── Chargement ───── */
  window.addEventListener("load", () => document.body.classList.add("is-loaded"));
  setTimeout(() => document.body.classList.add("is-loaded"), 1500);
  $("#year").textContent = new Date().getFullYear();

  /* ───── Header ───── */
  const header = $("#header");
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 20);
    header.classList.toggle("is-hidden", y > 400 && y > lastY && !nav.classList.contains("is-open"));
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ───── Menu mobile ───── */
  const burger = $("#burger");
  const nav = $("#nav");
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ───── Marquee des références ───── */
  const names = projects.filter((p) => p.category !== "particulier").map((p) => p.title);
  const chunk = names.map((n) => `<span>${esc(n)}</span><i aria-hidden="true">✦</i>`).join("");
  $("#marquee").innerHTML = chunk + chunk;

  /* ───── Galerie ───── */
  const grid = $("#grid");
  $("#countAll").textContent = projects.length;
  grid.innerHTML = projects
    .map(
      (p, i) => `
    <button class="card" data-cat="${p.category}" data-index="${i}" aria-label="Voir le projet ${esc(p.title)}">
      <div class="card__media">
        <img src="${esc(p.images[0])}" alt="${esc(p.title)} — ${esc(cats[p.category] || "")} rénové par EMBI" loading="lazy" />
        <div class="card__overlay">
          <span class="card__badge">${esc(cats[p.category] || "")}</span>
          <span class="card__open" aria-hidden="true">↗</span>
        </div>
      </div>
      <div class="card__info">
        <h3 class="card__title">${esc(p.title)}</h3>
        <span class="card__idx">${pad(i + 1)}</span>
      </div>
    </button>`
    )
    .join("");

  let visible = projects.map((_, i) => i);
  $$(".filter").forEach((btn) =>
    btn.addEventListener("click", () => {
      $$(".filter").forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-pressed", b === btn);
      });
      const f = btn.dataset.filter;
      visible = [];
      $$(".card", grid).forEach((c) => {
        const show = f === "all" || c.dataset.cat === f;
        c.hidden = !show;
        if (show) {
          visible.push(+c.dataset.index);
          c.style.animation = "none";
          void c.offsetWidth;
          c.style.animation = "";
        }
      });
    })
  );
  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (card) openModal(+card.dataset.index, card);
  });

  /* ───── Liste des références + aperçu au survol ───── */
  const refsList = $("#refsList");
  refsList.innerHTML = projects
    .map(
      (p, i) => `<li><button data-index="${i}">
        <span class="n">${pad(i + 1)}</span><span class="t">${esc(p.title)}</span><span class="c">${esc(cats[p.category] || "")}</span>
      </button></li>`
    )
    .join("");
  const preview = $("#refsPreview");
  const previewImg = $("img", preview);
  let px = 0, py = 0, tx = 0, ty = 0, raf = null;
  const follow = () => {
    px += (tx - px) * 0.18;
    py += (ty - py) * 0.18;
    preview.style.left = px + "px";
    preview.style.top = py + "px";
    raf = Math.abs(tx - px) + Math.abs(ty - py) > 0.5 ? requestAnimationFrame(follow) : null;
  };
  refsList.addEventListener("mousemove", (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!preview.classList.contains("is-on")) { px = tx; py = ty; }
    if (!raf) raf = requestAnimationFrame(follow);
  });
  refsList.addEventListener("mouseover", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    previewImg.src = projects[+b.dataset.index].images[0];
    preview.classList.add("is-on");
  });
  refsList.addEventListener("mouseleave", () => preview.classList.remove("is-on"));
  refsList.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) { preview.classList.remove("is-on"); visible = projects.map((_, i) => i); openModal(+b.dataset.index, b); }
  });

  /* ───── Lightbox ───── */
  const modal = $("#modal");
  let current = 0, lastFocus = null;
  const showImage = (src) => {
    const img = $("#modalImg");
    img.style.opacity = 0;
    img.onload = () => (img.style.opacity = 1);
    img.src = src;
    $$("#modalThumbs button").forEach((b) => b.classList.toggle("is-active", b.dataset.src === src));
  };
  const fill = (i) => {
    current = i;
    const p = projects[i];
    $("#modalCat").textContent = cats[p.category] || "";
    $("#modalTitle").textContent = p.title;
    $("#modalText").textContent =
      p.text || `Projet ${(cats[p.category] || "").toLowerCase()} réalisé clé en main par EMBI, de l'étude à la livraison.`;
    $("#modalImg").alt = `${p.title} — rénovation EMBI`;
    const thumbs = $("#modalThumbs");
    thumbs.innerHTML =
      p.images.length > 1
        ? p.images.map((src, k) => `<button data-src="${esc(src)}" aria-label="Photo ${k + 1}"><img src="${esc(src)}" alt="" /></button>`).join("")
        : "";
    showImage(p.images[0]);
    const pos = visible.indexOf(i);
    $("#modalCount").textContent = `${pad(pos + 1)} / ${pad(visible.length)}`;
  };
  const step = (d) => {
    const pos = visible.indexOf(current);
    fill(visible[(pos + d + visible.length) % visible.length]);
  };
  function openModal(i, from) {
    lastFocus = from || document.activeElement;
    if (!visible.includes(i)) visible = projects.map((_, k) => k);
    fill(i);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => $(".modal__close", modal).focus(), 50);
  }
  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  };
  $$("[data-close]", modal).forEach((el) => el.addEventListener("click", closeModal));
  $("#modalPrev").addEventListener("click", () => step(-1));
  $("#modalNext").addEventListener("click", () => step(1));
  $("#modalThumbs").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) showImage(b.dataset.src);
  });
  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("is-open")) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
  let touchX = null;
  modal.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
  modal.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    touchX = null;
  });

  /* ───── Apparition au scroll ───── */
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const siblings = [...en.target.parentElement.children].filter((c) => c.classList.contains("reveal"));
        en.target.style.transitionDelay = Math.min(siblings.indexOf(en.target), 6) * 70 + "ms";
        en.target.classList.add("is-in");
        io.unobserve(en.target);
      }),
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ───── Compteurs ───── */
  const countIO = new IntersectionObserver((entries) =>
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target, end = +el.dataset.count, t0 = performance.now();
      const tick = (t) => {
        const k = Math.min((t - t0) / 1400, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + (k === 1 ? "+" : "");
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    })
  );
  $$("[data-count]").forEach((el) => countIO.observe(el));

  /* ───── Formulaire → e-mail pré-rempli vers sec@embi.fr ───── */
  const form = $("#form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    $$("[required]", form).forEach((input) => {
      const valid = input.value.trim() && input.checkValidity();
      input.closest(".field").classList.toggle("is-invalid", !valid);
      if (!valid) ok = false;
    });
    const note = $("#formNote");
    if (!ok) { note.textContent = "Merci de renseigner votre nom et un e-mail valide."; return; }
    const d = new FormData(form);
    const subject = `Demande de devis — ${d.get("type")}`;
    const body = `Nom : ${d.get("nom")}\nTéléphone : ${d.get("tel") || "—"}\nE-mail : ${d.get("email")}\nProjet : ${d.get("type")}\n\n${d.get("message") || ""}`;
    window.location.href = `mailto:sec@embi.fr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    note.textContent = "Votre messagerie s'ouvre avec la demande pré-remplie. Merci !";
  });
})();
