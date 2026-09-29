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
      const k = Math.min((t - t0) / 1800, 1);
      count.textContent = Math.round(100 * (1 - Math.pow(1 - k, 3)));
      k < 1 ? requestAnimationFrame(tick) : finishLoad();
    };
    requestAnimationFrame(tick);
    setTimeout(finishLoad, 3200);
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

  /* ───── Mur à poncer : le visiteur « rénove » l'accueil ───── */
  const canvas = $("#plaster");
  const hint = $("#hint");
  const ctx = canvas.getContext && canvas.getContext("2d");
  let revealed = false;
  const reveal = () => {
    if (revealed) return;
    revealed = true;
    hero.classList.add("is-revealed");
    hint.classList.remove("is-on");
  };
  if (!ctx || reduce) {
    document.documentElement.classList.add("no-canvas");
    reveal();
  } else {
    const COLS = 24, ROWS = 14, cells = new Set();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = 0, H = 0, last = null, touched = false;
    const rnd = Math.random;
    const paint = () => {
      W = hero.offsetWidth; H = hero.offsetHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      // béton brut
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#3b3733"); g.addColorStop(1, "#1d1b19");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // taches d'enduit
      for (let i = 0; i < 16; i++) {
        const x = rnd() * W, y = rnd() * H, r = 80 + rnd() * 220;
        const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, "rgba(210,200,185,0.09)"); rg.addColorStop(1, "rgba(210,200,185,0)");
        ctx.fillStyle = rg; ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      // grain
      for (let i = 0; i < (W * H) / 70; i++) {
        ctx.fillStyle = rnd() > 0.5 ? `rgba(255,255,255,${rnd() * 0.05})` : `rgba(0,0,0,${rnd() * 0.14})`;
        ctx.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2, 1 + rnd() * 2);
      }
      // quadrillage de plan
      ctx.strokeStyle = "rgba(255,90,31,0.10)"; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 48) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 48) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke(); }
      // tracés à la craie
      ctx.strokeStyle = "rgba(255,255,255,0.16)"; ctx.lineWidth = 1.5; ctx.setLineDash([10, 7]);
      ctx.strokeRect(W * 0.06, H * 0.16, W * 0.88, H * 0.7);
      ctx.beginPath(); ctx.moveTo(W * 0.55, H * 0.16); ctx.lineTo(W * 0.55, H * 0.5); ctx.lineTo(W * 0.94, H * 0.5); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = `700 12px Manrope, system-ui, sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillText("MUR À OUVRIR", W * 0.56 + 10, H * 0.16 + 22);
      ctx.fillText(`${(W / 100).toFixed(2).replace(".", ",")} m`, W * 0.5, H * 0.16 - 10);
      // pochoir « AVANT »
      ctx.font = `800 ${Math.min(W * 0.2, 280)}px "Bricolage Grotesque", system-ui, sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.045)";
      ctx.textAlign = "right"; ctx.textBaseline = "top";
      ctx.fillText("AVANT", W * 0.96, H * 0.14);
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      cells.clear();
    };
    const brush = (x, y) => {
      if (revealed) return;
      const R = W < 700 ? 50 : 78;
      ctx.globalCompositeOperation = "destination-out";
      const from = last || { x, y };
      const steps = Math.max(1, Math.ceil(Math.hypot(x - from.x, y - from.y) / (R / 4)));
      for (let i = 1; i <= steps; i++) {
        const px = from.x + ((x - from.x) * i) / steps, py = from.y + ((y - from.y) * i) / steps;
        const rg = ctx.createRadialGradient(px, py, R * 0.3, px, py, R);
        rg.addColorStop(0, "rgba(0,0,0,1)"); rg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = rg;
        ctx.beginPath(); ctx.arc(px, py, R, 0, Math.PI * 2); ctx.fill();
        const c0 = Math.floor(((px - R * 0.6) / W) * COLS), c1 = Math.floor(((px + R * 0.6) / W) * COLS);
        const r0 = Math.floor(((py - R * 0.6) / H) * ROWS), r1 = Math.floor(((py + R * 0.6) / H) * ROWS);
        for (let c = Math.max(0, c0); c <= Math.min(COLS - 1, c1); c++)
          for (let r = Math.max(0, r0); r <= Math.min(ROWS - 1, r1); r++) cells.add(c * 100 + r);
      }
      last = { x, y };
      if (cells.size > COLS * ROWS * 0.4) reveal();
    };
    // balayage automatique (intro + bouton « Tout rénover »)
    const sweep = (points, duration, done) => {
      const t0 = performance.now();
      last = null;
      const f = (t) => {
        const k = Math.min(Math.max((t - t0) / duration, 0), 1);
        const pos = k * (points.length - 1), i = Math.floor(pos), fr = pos - i;
        const a = points[i], b = points[Math.min(i + 1, points.length - 1)];
        brush(W * (a[0] + (b[0] - a[0]) * fr), H * (a[1] + (b[1] - a[1]) * fr));
        if (k < 1 && !revealed) requestAnimationFrame(f);
        else { last = null; done && done(); }
      };
      requestAnimationFrame(f);
    };
    paint();
    let lastW = W;
    window.addEventListener("resize", () => {
      if (!revealed && hero.offsetWidth !== lastW) { lastW = hero.offsetWidth; paint(); }
    });

    const isTouch = matchMedia("(hover: none)").matches;
    $("#hintText").textContent = isTouch ? "Glissez le doigt : on rénove" : "Passez la souris : on rénove";
    const placeHint = (x, y) => { hint.style.left = x + "px"; hint.style.top = y + "px"; };

    hero.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse" || revealed) return;
      const r = hero.getBoundingClientRect();
      touched = true;
      brush(e.clientX - r.left, e.clientY - r.top);
      placeHint(e.clientX, e.clientY);
      hint.classList.add("is-on");
      $("#hintText").textContent = cells.size > COLS * ROWS * 0.2 ? "Continuez… presque fini !" : "Passez la souris : on rénove";
    });
    hero.addEventListener("pointerleave", () => { last = null; hint.classList.remove("is-on"); });
    hero.addEventListener("touchstart", () => { last = null; touched = true; hint.classList.remove("is-on"); }, { passive: true });
    hero.addEventListener("touchmove", (e) => {
      const r = hero.getBoundingClientRect(), t = e.touches[0];
      brush(t.clientX - r.left, t.clientY - r.top);
    }, { passive: true });
    window.addEventListener("scroll", () => { if (scrollY > H * 0.3) reveal(); }, { passive: true });
    $("#renovateBtn").addEventListener("click", () =>
      sweep([[0.05, 0.1], [0.95, 0.2], [0.05, 0.35], [0.95, 0.5], [0.05, 0.65], [0.95, 0.8], [0.05, 0.95]], 1100, reveal)
    );
    // à l'arrivée : un premier coup de ponceuse pour surprendre et montrer le geste
    document.addEventListener("embi:loaded", () => {
      setTimeout(() => {
        sweep([[0.62, 0.12], [0.78, 0.3], [0.66, 0.5], [0.86, 0.66]], 1300, () => {
          if (touched || revealed) return;
          const r = hero.getBoundingClientRect();
          placeHint(r.left + W * (isTouch ? 0.08 : 0.6), r.top + H * (isTouch ? 0.3 : 0.4));
          hint.classList.add("is-on");
          if (isTouch) setTimeout(() => hint.classList.remove("is-on"), 3500);
        });
      }, 500);
    });
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
