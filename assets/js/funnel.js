/* Tunnel de conversion « Votre projet en 3 questions » (bas de chaque page).
   Une réponse choisie → question suivante ; à la fin, les coordonnées puis l'envoi direct (FormSubmit, sans quitter la page).
   Les boutons « Devis gratuit » de la page descendent jusqu'au tunnel au lieu d'ouvrir la page Contact. */
(() => {
  const quiz = document.getElementById("quiz");
  if (!quiz) return;
  const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const projects = window.EMBI_PROJECTS || [];
  const section = document.getElementById("projet");
  const sets = $$(".quiz__set", quiz), QN = sets.length - 1;
  const stepEl = $("#quizStep"), bar = $("#quizBar"), back = $("#quizBack"), restart = $("#quizRestart"), note = $("#quizNote");
  $("#quizPage").value = location.pathname;
  quiz.noValidate = true;

  let step = 0;
  const show = (n) => {
    step = n;
    sets.forEach((f, k) => f.classList.toggle("is-current", k === n));
    back.hidden = n === 0;
    restart.hidden = n < QN;
    bar.style.transform = `scaleX(${Math.min(n, QN) / QN})`;
    stepEl.textContent = n < QN ? `Question ${n + 1} / ${QN}` : "C'est presque prêt !";
    if (n === QN) {
      const picked = sets.slice(0, QN).map((f) => $("input:checked", f)).filter(Boolean);
      $("#quizRecap").innerHTML = picked.map((i) => `<li>${esc(i.value)}</li>`).join("");
      const lieu = $('input[name="lieu"]:checked', quiz);
      const cat = lieu && lieu.dataset.cat;
      const refs = cat ? projects.filter((p) => p.category === cat).slice(0, 3) : [];
      const box = $("#quizRefs");
      box.hidden = !refs.length;
      box.innerHTML = refs.length ? `Nous avons déjà réalisé des projets comme le vôtre : ${refs.map((r) => `<a href="${window.EMBI_PROJECT_URL(r.id)}"><strong>${esc(r.title)}</strong></a>`).join(", ")}.` : "";
    }
  };
  const pick = (input) => {
    input.checked = true;
    $$(".quiz__opt", input.closest(".quiz__set")).forEach((l) => l.classList.toggle("is-picked", l.contains(input)));
  };
  const nextEmpty = () => { const k = sets.findIndex((f, j) => j < QN && !$("input:checked", f)); return k === -1 ? QN : k; };

  let timer = null;
  quiz.addEventListener("change", (e) => {
    const opt = e.target.closest(".quiz__opt input");
    if (!opt) return;
    pick(opt);
    clearTimeout(timer);
    timer = setTimeout(() => show(nextEmpty()), reduce ? 0 : 220);
  });
  back.addEventListener("click", () => { clearTimeout(timer); show(Math.max(step - 1, 0)); });
  restart.addEventListener("click", () => {
    clearTimeout(timer);
    $$("input[type=radio]", quiz).forEach((i) => (i.checked = false));
    $$(".is-picked", quiz).forEach((l) => l.classList.remove("is-picked"));
    show(0);
  });

  // lieu déjà connu (page secteur ou chantier, ou lien « ?type= ») : pré-coché, on commence à la question 2
  const preset = (cat) => {
    const opt = cat && $(`input[name="lieu"][data-cat="${cat}"]`, quiz);
    if (opt && cat !== "particulier") { pick(opt); show(nextEmpty()); }
  };
  show(0);
  preset(section.dataset.preset || new URLSearchParams(location.search).get("type"));

  // boutons « Devis gratuit » de la page → descente douce jusqu'au tunnel (le menu et le pied de page gardent leur lien)
  $$('main a[href^="/contact/"]').forEach((a) => {
    if (a.closest("#projet") || !/devis/i.test(a.textContent)) return;
    const type = new URL(a.href, location.href).searchParams.get("type");
    a.setAttribute("href", "#projet");
    a.addEventListener("click", (e) => {
      e.preventDefault();
      if (type) preset(type);
      section.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      setTimeout(() => { const f = $(".quiz__set.is-current input, .quiz__set.is-current button", quiz); if (f) f.focus({ preventScroll: true }); }, reduce ? 0 : 700);
    });
  });

  // envoi
  const mailto = () => {
    const lines = [...new FormData(quiz).entries()].filter(([k]) => !k.startsWith("_") && k !== "consentement").map(([k, v]) => `${k} : ${v}`);
    return `mailto:sec@embi.fr?subject=${encodeURIComponent("Demande de devis")}&body=${encodeURIComponent(lines.join("\n"))}`;
  };
  quiz.addEventListener("submit", async (e) => {
    e.preventDefault();
    const missing = $$(".quiz__final [required]", quiz).find((i) => !i.checkValidity());
    if (missing) {
      note.textContent = missing.type === "checkbox" ? "Merci d'accepter l'utilisation de vos informations." : missing.type === "email" && missing.value ? "Cette adresse e-mail ne semble pas valide." : "Merci de renseigner votre nom et votre e-mail.";
      missing.focus();
      return;
    }
    if (nextEmpty() < QN) { show(nextEmpty()); return; }
    const btn = $('button[type="submit"]', quiz);
    btn.disabled = true;
    note.textContent = "Envoi en cours…";
    try {
      const url = quiz.getAttribute("action").replace("formsubmit.co/", "formsubmit.co/ajax/");
      const r = await fetch(url, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(quiz) });
      const res = await r.json().catch(() => ({}));
      if (!r.ok || String(res.success) !== "true") throw new Error(res.message || r.status);
      location.href = "/merci/";
    } catch (err) {
      btn.disabled = false;
      note.innerHTML = `L'envoi n'a pas abouti. Appelez-nous au <a href="tel:+33145726524">01 45 72 65 24</a> ou <a href="${mailto()}">envoyez votre demande par e-mail</a>.`;
    }
  });
})();
