(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const projects = window.EMBI_PROJECTS || [];
  const cats = window.EMBI_CATEGORIES || {};
  const pad = (n) => String(n).padStart(2, "0");
  const esc = (str = "") =>
    str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  /* ───── Chargement ───── */
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loader = $("#loader");
  let loaded = false;
  const finishLoad = () => {
    if (loaded) return;
    loaded = true;
    loader.classList.add("is-done");
    setTimeout(() => {
      document.body.classList.add("is-loaded");
      document.dispatchEvent(new Event("embi:loaded"));
    }, reduce ? 0 : 250);
  };
  if (reduce) finishLoad();
  else {
    // compteur 0 → 100 %, terminé au plus tard après ~1,6 s
    const t0 = performance.now(), count = $("#loaderCount");
    const tick = (t) => {
      const k = Math.min((t - t0) / 2300, 1);
      count.textContent = Math.round(100 * (1 - Math.pow(1 - k, 3)));
      k < 1 ? requestAnimationFrame(tick) : finishLoad();
    };
    requestAnimationFrame(tick);
    setTimeout(finishLoad, 3800);
  }
  $("#year").textContent = new Date().getFullYear();

  /* ───── Header ───── */
  const header = $("#header");
  const hero = $(".hero");
  header.classList.add("on-dark");
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 20);
    header.classList.toggle("on-dark", y < hero.offsetHeight - 60);
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
  const words2 = ["Chantier EMBI", "Rénovation", "Gros œuvre", "Plomberie", "Électricité", "Isolation", "Carrelage", "Parquet", "Façades", "Clé en main"];
  const chunk2 = words2.map((n) => `<span>${n}</span><i>✦</i>`).join("");
  $("#marquee2").innerHTML = chunk2 + chunk2;

  /* ───── Mot tournant du titre ───── */
  const rot = $("#rotator");
  if (rot) {
    const items = $$("span", rot);
    let r = 0;
    const size = () => (rot.style.width = items[r].offsetWidth + "px");
    document.fonts && document.fonts.ready.then(size);
    size();
    window.addEventListener("resize", size);
    if (!reduce)
      setInterval(() => {
        const prev = items[r];
        r = (r + 1) % items.length;
        prev.classList.remove("is-active");
        prev.classList.add("is-leaving");
        items[r].classList.remove("is-leaving");
        items[r].classList.add("is-active");
        size();
        setTimeout(() => prev.classList.remove("is-leaving"), 800);
      }, 2200);
  }

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

  /* ───── Sélection horizontale (défilement épinglé) ───── */
  const showcase = $("#selection");
  const track = $("#showcaseTrack");
  const featured = projects.map((p, i) => ({ p, i })).filter(({ p }) => p.featured);
  track.innerHTML =
    featured
      .map(
        ({ p, i }, k) => `
    <button class="shot" data-index="${i}" data-cursor="Voir" aria-label="Voir le projet ${esc(p.title)}">
      <div class="shot__media"><img src="${esc(p.images[0])}" alt="${esc(p.title)} — rénové par EMBI" loading="lazy" /><span class="shot__num">${pad(k + 1)}</span></div>
      <div class="shot__info"><h3 class="shot__title">${esc(p.title)}</h3><span class="shot__cat">${esc(cats[p.category] || "")}</span></div>
    </button>`
      )
      .join("") +
    `<div class="shot shot--end"><a href="#realisations">Tous nos<br/>chantiers ↓</a></div>`;
  track.addEventListener("click", (e) => {
    const b = e.target.closest(".shot[data-index]");
    if (b) { visible = projects.map((_, k) => k); openModal(+b.dataset.index, b); }
  });
  const bar = $("#showcaseBar");
  const wide = matchMedia("(min-width: 861px)");
  let dist = 0;
  const sizeShowcase = () => {
    if (!wide.matches) { showcase.style.height = ""; track.style.transform = ""; return; }
    dist = Math.max(0, track.scrollWidth - innerWidth);
    showcase.style.height = innerHeight + dist + "px";
  };
  const scrollShowcase = () => {
    if (!wide.matches) return;
    const top = showcase.getBoundingClientRect().top;
    const k = Math.min(Math.max(-top / (dist || 1), 0), 1);
    track.style.transform = `translate3d(${-k * dist}px,0,0)`;
    bar.style.transform = `scaleX(${k})`;
  };
  window.addEventListener("resize", () => { sizeShowcase(); scrollShowcase(); });
  window.addEventListener("load", () => { sizeShowcase(); scrollShowcase(); });
  window.addEventListener("scroll", scrollShowcase, { passive: true });
  sizeShowcase();

  /* ───── Texte qui s'allume mot à mot ───── */
  $$("[data-words]").forEach((el) => {
    const wrap = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part.trim()) return frag.append(part);
            const sp = document.createElement("span");
            sp.className = "w";
            sp.textContent = part;
            frag.append(sp);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) wrap(n);
      });
    };
    wrap(el);
    const ws = $$(".w", el);
    const light = () => {
      const r = el.getBoundingClientRect();
      const k = Math.min(Math.max((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35), 0), 1);
      const n = Math.round(k * ws.length);
      ws.forEach((w, i) => w.classList.toggle("is-on", i < n));
    };
    window.addEventListener("scroll", light, { passive: true });
    light();
  });

  /* ───── Barre de progression ───── */
  const progress = $("#progress");
  window.addEventListener(
    "scroll",
    () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    },
    { passive: true }
  );

  /* ───── Curseur personnalisé + boutons magnétiques ───── */
  if (matchMedia("(hover: hover) and (pointer: fine)").matches && !reduce) {
    const cur = $("#cursor"), label = $("#cursorLabel");
    let x = -100, y = -100, cxp = -100, cyp = -100;
    document.addEventListener("mousemove", (e) => { x = e.clientX; y = e.clientY; });
    document.addEventListener("mouseleave", () => cur.classList.add("is-hidden"));
    document.addEventListener("mouseenter", () => cur.classList.remove("is-hidden"));
    const move = () => {
      cxp += (x - cxp) * 0.22;
      cyp += (y - cyp) * 0.22;
      cur.style.transform = `translate3d(${cxp}px, ${cyp}px, 0)`;
      requestAnimationFrame(move);
    };
    move();
    document.addEventListener("mouseover", (e) => {
      const view = e.target.closest(".card, .shot[data-index], .refs__list button");
      const link = e.target.closest("a, button, input, textarea, label");
      cur.classList.toggle("is-view", !!view);
      cur.classList.toggle("is-link", !view && !!link);
      label.textContent = view ? "Voir" : "";
    });
    $$("[data-magnetic]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.35}px)`;
      });
      el.addEventListener("mouseleave", () => (el.style.transform = ""));
    });
  }

  /* ───── Logo géant qui réagit à la souris ───── */
  const big = $("#bigLogo");
  if (big && matchMedia("(pointer: fine)").matches && !reduce) {
    const chars = $$(".ch", big);
    const footer = $(".footer");
    footer.addEventListener("mousemove", (e) => {
      chars.forEach((c) => {
        const r = c.getBoundingClientRect();
        const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
        const k = Math.max(0, 1 - d / 420);
        c.style.fontVariationSettings = `"wght" ${Math.round(800 - k * 600)}`;
        c.classList.toggle("is-hot", k > 0.55);
      });
    });
    footer.addEventListener("mouseleave", () => chars.forEach((c) => { c.style.fontVariationSettings = ""; c.classList.remove("is-hot"); }));
  }

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
