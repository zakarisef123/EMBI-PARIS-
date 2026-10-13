/* Appels à l'action flottants (toutes les pages) :
   barre « Appeler / Devis gratuit » en bas d'écran sur mobile, boutons flottants sur ordinateur.
   Masqués en haut de page, quand le formulaire de contact ou le pied de page est visible, et quand le menu est ouvert. */
(() => {
  const onContact = !!document.getElementById("form");
  const devisHref = () => {
    const type = document.body.dataset.ctaType || "";
    if (document.getElementById("projet")) return "#projet";
    return onContact ? "#contact" : `/contact/${type ? `?type=${type}` : ""}`;
  };
  const bar = document.createElement("div");
  bar.className = "fab";
  bar.innerHTML = `
    <a class="fab__tel" href="tel:+33145726524" aria-label="Appeler EMBI au 01 45 72 65 24">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>
      <span>Appeler</span>
    </a>
    ${location.pathname.startsWith("/urgence/") ? "" : '<a class="fab__rappel" href="#rappel" data-rappel>Être rappelé</a>'}
    <a class="fab__devis" href="${devisHref()}">Mon devis gratuit <span aria-hidden="true">→</span></a>`;
  document.body.appendChild(bar);
  const devis = bar.querySelector(".fab__devis");

  let blocked = 0;
  const watch = [document.getElementById("contact"), document.getElementById("projet"), document.querySelector(".footer")].filter(Boolean);
  const seen = new Set();
  const io = new IntersectionObserver((en) => {
    en.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
    blocked = seen.size;
    update();
  }, { threshold: 0.05 });
  watch.forEach((el) => io.observe(el));

  const nav = document.getElementById("nav");
  // Mobile : la barre recouvre le bas de l'écran. Elle se cache quand on descend (lecture, appui sur le contenu)
  // et revient quand on remonte, pour ne jamais « voler » un appui destiné à la page.
  const mobile = matchMedia("(max-width: 760px)");
  let lastY = scrollY, goingDown = false, idle = false, idleTimer = null;
  function update(e) {
    const y = scrollY;
    if (Math.abs(y - lastY) > 6) { goingDown = y > lastY; lastY = y; }
    // mobile : la barre s'efface aussi 2 s après l'arrêt du défilement, pour libérer le bas de l'écran
    if (e && e.type === "scroll" && mobile.matches) {
      idle = false;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { idle = true; update(); }, 2000);
    }
    const show = y > innerHeight * 0.6 && !blocked && !(nav && nav.classList.contains("is-open")) && !(mobile.matches && (goingDown || idle));
    if (show) devis.setAttribute("href", devisHref());
    bar.classList.toggle("is-on", show);
  }
  addEventListener("scroll", update, { passive: true });
  if (nav) new MutationObserver(update).observe(nav, { attributes: true, attributeFilter: ["class"] });
  update();
})();

/* Rappel et guide (assets/css/style.css, « Rappel et guide ») :
   - « Être rappelé » : nom, téléphone, créneau. Sur ordinateur, l'encart glisse dans un coin une fois la moitié de la page lue ;
     sur téléphone, rien ne s'ouvre tout seul : on l'ouvre depuis la barre du bas (bouton « Rappel »).
   - Guide « 10 questions avant de rénover à Paris » contre un e-mail : proposé sur ordinateur quand le pointeur quitte la page.
   Une seule ouverture automatique par visite (stockage de session), jamais sur les pages Contact, Urgence, légales et Merci,
   ni pendant le bandeau cookies, ni quand le questionnaire est à l'écran. Envoi par FormSubmit, comme les autres formulaires. */
(() => {
  const P = location.pathname;
  if (/^\/(contact|merci|mentions-legales|politique-de-confidentialite|cgv)\//.test(P)) return;
  const urgence = P.startsWith("/urgence/");
  const action = (document.querySelector("form[action*='formsubmit.co']") || {}).action || "https://formsubmit.co/sec@embi.fr";
  const ajax = action.replace("formsubmit.co/", "formsubmit.co/ajax/");
  const desktop = matchMedia("(min-width: 761px) and (pointer: fine)");
  const store = { get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: (k) => { try { sessionStorage.setItem(k, "1"); } catch (e) { /* navigation privée */ } } };
  const AUTO = "embi-encart";
  const consent = (id) => `<label class="consent" for="${id}"><input type="checkbox" id="${id}" name="consentement" value="Accepté" required /><span>J'accepte qu'EMBI utilise ces informations pour répondre à ma demande, conformément à la <a href="/politique-de-confidentialite/">politique de confidentialité</a>.</span></label>`;

  const box = document.createElement("aside");
  box.className = "nudge";
  box.hidden = true;
  box.setAttribute("aria-live", "polite");
  box.innerHTML = `
    <div class="nudge__card" role="dialog" aria-modal="false" aria-labelledby="nudgeT">
      <button type="button" class="nudge__x" aria-label="Fermer">✕</button>
      <form class="nudge__f" data-kind="rappel" novalidate>
        <p class="nudge__k">Être rappelé</p>
        <p class="nudge__t" id="nudgeT">Parlons de votre projet, <em>à l'heure qui vous arrange.</em></p>
        <label class="nudge__field"><span>Votre nom</span><input name="nom" autocomplete="name" required /></label>
        <label class="nudge__field"><span>Votre téléphone</span><input name="telephone" type="tel" autocomplete="tel" required /></label>
        <fieldset class="nudge__slots"><legend>Le meilleur moment</legend>
          ${["Le matin", "L'après-midi", "Peu importe"].map((v, i) => `<label><input type="radio" name="creneau" value="${v}"${i === 2 ? " checked" : ""} /><span>${v}</span></label>`).join("")}
        </fieldset>
        ${consent("consentRappel")}
        <button type="submit" class="btn btn--accent">Je veux être rappelé <span aria-hidden="true">→</span></button>
      </form>
      <form class="nudge__f" data-kind="guide" novalidate hidden>
        <p class="nudge__k">Guide gratuit · PDF</p>
        <p class="nudge__t">10 questions à se poser <em>avant de rénover à Paris.</em></p>
        <p class="nudge__p">Budget, copropriété, autorisations, devis, garanties : les points que nous abordons à chaque première visite.</p>
        <label class="nudge__field"><span>Votre e-mail</span><input name="email" type="email" autocomplete="email" required /></label>
        ${consent("consentGuide")}
        <button type="submit" class="btn btn--accent">Je reçois le guide <span aria-hidden="true">→</span></button>
      </form>
      <p class="nudge__note" role="status"></p>
    </div>`;
  document.body.appendChild(box);
  const $ = (s, el = box) => el.querySelector(s);
  const forms = { rappel: $('[data-kind="rappel"]'), guide: $('[data-kind="guide"]') };
  const note = $(".nudge__note");

  const blocked = () => document.documentElement.classList.contains("has-cookie-banner") || (document.getElementById("nav") || {}).classList?.contains("is-open");
  const open = (kind, auto) => {
    if (auto && (store.get(AUTO) || blocked())) return;
    if (auto) store.set(AUTO);
    Object.entries(forms).forEach(([k, f]) => (f.hidden = k !== kind));
    note.textContent = "";
    box.hidden = false;
    requestAnimationFrame(() => box.classList.add("is-on"));
    if (!auto) setTimeout(() => { const i = $("input", forms[kind]); if (i) i.focus(); }, 300);
  };
  const close = () => { box.classList.remove("is-on"); setTimeout(() => (box.hidden = true), 350); store.set(AUTO); };
  $(".nudge__x").addEventListener("click", close);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !box.hidden) close(); });
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-rappel], [data-guide]");
    if (!t) return;
    e.preventDefault();
    open(t.hasAttribute("data-guide") ? "guide" : "rappel", false);
  });

  // ouverture automatique (ordinateur) : à mi-page pour le rappel, en quittant la page pour le guide
  if (!urgence) {
    const quiz = document.getElementById("projet");
    let quizSeen = false;
    if (quiz) new IntersectionObserver((en) => en.forEach((x) => (quizSeen = x.isIntersecting)), { threshold: 0.1 }).observe(quiz);
    addEventListener("scroll", function half() {
      if (!desktop.matches) return;
      const h = document.documentElement.scrollHeight - innerHeight;
      if (h > 0 && scrollY / h > 0.5 && !quizSeen) { removeEventListener("scroll", half); open("rappel", true); }
    }, { passive: true });
    document.addEventListener("mouseout", (e) => {
      if (!desktop.matches || e.relatedTarget || e.clientY > 8) return;
      if (scrollY < innerHeight * 0.5) return; // pas avant d'avoir lu un peu
      open("guide", true);
    });
  }

  // envoi
  const send = async (form, kind) => {
    const req = [...form.querySelectorAll("[required]")];
    const bad = req.filter((i) => (i.type === "checkbox" ? !i.checked : i.type === "tel" ? i.value.replace(/\D/g, "").length < 9 : !i.value.trim() || !i.checkValidity()));
    req.forEach((i) => (i.closest(".nudge__field, .consent") || i).classList.toggle("is-invalid", bad.includes(i)));
    if (bad.length) { note.textContent = "Merci de compléter les champs indiqués."; bad[0].focus(); return; }
    const data = Object.fromEntries(new FormData(form).entries());
    const body = kind === "rappel"
      ? { _subject: `Demande de rappel : ${data.nom} · ${data.creneau} (site EMBI)`, Nom: data.nom, Téléphone: data.telephone, Créneau: data.creneau, Page: P, Consentement: "Accepté" }
      : { _subject: "Guide « 10 questions avant de rénover » : à envoyer (site EMBI)", "E-mail": data.email, Page: P, Consentement: "Accepté" };
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    note.textContent = "Envoi en cours…";
    try {
      const r = await fetch(ajax, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ ...body, _template: "table", _captcha: "false" }) });
      const res = await r.json().catch(() => ({}));
      if (!r.ok || String(res.success) !== "true") throw new Error(res.message || r.status);
      form.hidden = true;
      note.innerHTML = kind === "rappel"
        ? "Merci&nbsp;! Votre demande est bien partie : nous vous rappelons sur le créneau choisi."
        : 'Merci&nbsp;! Votre guide est prêt : <a href="/documents/guide-renovation-paris.pdf" target="_blank" rel="noopener">ouvrir le guide (PDF)</a>.';
    } catch (err) {
      btn.disabled = false;
      note.innerHTML = 'L\'envoi n\'a pas abouti. Appelez-nous au <a href="tel:+33145726524">01 45 72 65 24</a>.';
    }
  };
  Object.entries(forms).forEach(([k, f]) => f.addEventListener("submit", (e) => { e.preventDefault(); send(f, k); }));
})();
