/* Formulaire de devis (page Contact : particulier / professionnel) et demande d'intervention (pages Urgence).
   - Contact : deux onglets ; arrivée depuis une page secteur ou Sur mesure (?type=hotel, ?type=conception…) : choix pré-coché.
   - Urgence : les problèmes du métier choisi (ils défilent sur téléphone) et le récapitulatif de la demande.
   - Champs obligatoires contrôlés avant l'envoi ; l'objet de l'e-mail résume la demande (« URGENT · Plomberie : Fuite d'eau · 75017 »).
   - Envoi sans quitter la page (FormSubmit), ou envoi classique quand une pièce jointe est ajoutée.
   - En cas d'échec : le téléphone, et la demande déjà rédigée dans un e-mail. */
(() => {
  const forms = [...document.querySelectorAll("form[data-form]")];
  if (!forms.length) return;
  const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const params = new URLSearchParams(location.search);
  const MAX = 5 * 1024 * 1024; // pièce jointe : 5 Mo au plus
  const off = (el) => !!el.closest("fieldset[disabled]");

  // valeur d'un champ (ou des cases cochées d'un groupe), hors groupes désactivés
  const val = (form, name) => $$(`[name="${name}"]`, form).filter((i) => !off(i) && (!/radio|checkbox/.test(i.type) || i.checked)).map((i) => i.value.trim()).filter(Boolean).join(", ");
  // la demande, dans l'ordre du formulaire : [intitulé, réponse]
  const entries = (form) => $$("[data-label]", form).flatMap((box) => {
    if (off(box) || box.matches(".cform__file")) return [];
    const inputs = box.matches("input") ? [box] : $$("input, select, textarea", box);
    const v = inputs.filter((i) => !/radio|checkbox/.test(i.type) || i.checked).map((i) => i.value.trim()).filter(Boolean).join(", ");
    return v ? [[box.dataset.label, v]] : [];
  });
  const SUBJECT = {
    particulier: (f) => `Devis particulier : ${val(f, "travaux") || val(f, "type_de_bien")} · ${[val(f, "code_postal"), val(f, "ville")].filter(Boolean).join(" ")}`,
    pro: (f) => `Devis professionnel : ${[val(f, "etablissement"), val(f, "societe")].filter(Boolean).join(", ")} · ${val(f, "code_postal")}`,
    urgence: (f) => `${val(f, "besoin") === "Intervention urgente" ? "URGENT · " : ""}${val(f, "metier")} : ${val(f, "probleme")} · ${val(f, "code_postal")}`,
  };
  const subjectOf = (form) => `${SUBJECT[form.dataset.form](form).replace(/\s·\s*$/, "")} (site EMBI)`;

  /* ───── Contrôle des champs obligatoires ───── */
  const boxOf = (el) => el.closest("[data-req]") || el.closest(".field, .consent") || el;
  const okField = (el) => {
    if (el.matches("fieldset")) return !!$("input:checked", el);
    if (el.type === "checkbox") return el.checked;
    const v = el.value.trim();
    if (!v || !el.checkValidity()) return false;
    if (el.type === "tel") return v.replace(/\D/g, "").length >= 9;
    return true;
  };
  const check = (form, note) => {
    const req = [...$$("fieldset[data-req]", form).filter((f) => !f.disabled), ...$$("input[required], textarea[required], select[required]", form).filter((i) => !off(i))];
    const bad = req.filter((el) => !okField(el));
    req.forEach((el) => boxOf(el).classList.toggle("is-invalid", bad.includes(el)));
    if (!bad.length) return true;
    const names = bad.map((el) => (el.type === "checkbox" ? "votre accord (case à cocher)" : boxOf(el).dataset.label)).filter(Boolean);
    note.textContent = `Merci de compléter : ${names.join(", ")}.`;
    const first = boxOf(bad[0]);
    first.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    const focus = bad[0].matches("fieldset") ? $("input", bad[0]) : bad[0];
    if (focus) setTimeout(() => focus.focus({ preventScroll: true }), reduce ? 0 : 400);
    return false;
  };

  /* ───── Envoi ───── */
  const mailto = (form) => `mailto:sec@embi.fr?subject=${encodeURIComponent(subjectOf(form))}&body=${encodeURIComponent(entries(form).map(([k, v]) => `${k} : ${v}`).join("\n"))}`;
  // envoi classique (avec pièce jointe) : les cases cochées d'un même groupe sont réunies en un seul champ
  const flatten = (form) => $$(".chips--multi", form).forEach((fs) => {
    const boxes = $$('input[type="checkbox"]', fs);
    if (!boxes.length) return;
    const h = document.createElement("input");
    h.type = "hidden"; h.name = boxes[0].name; h.value = val(form, boxes[0].name);
    boxes.forEach((b) => (b.disabled = true));
    fs.after(h);
  });
  forms.forEach((form) => {
    form.noValidate = true;
    const note = $("[data-note]", form), btn = $('button[type="submit"]', form);
    const page = $("[data-page]", form);
    if (page) page.value = location.pathname;
    form.addEventListener("input", (e) => boxOf(e.target).classList.remove("is-invalid"));
    form.addEventListener("change", (e) => boxOf(e.target).classList.remove("is-invalid"));

    // pièce jointe : nom du fichier, ou refus s'il est trop lourd
    const file = $('input[type="file"]', form);
    if (file) {
      const hint = $("[data-file-hint]", form), text = hint.textContent;
      file.addEventListener("change", () => {
        const f = file.files[0];
        file.closest(".cform__file").classList.toggle("is-filled", !!f);
        if (f && f.size > MAX) {
          file.value = "";
          file.closest(".cform__file").classList.remove("is-filled");
          hint.textContent = "Ce fichier dépasse 5 Mo : choisissez-en un plus léger, ou envoyez-le à sec@embi.fr.";
          return;
        }
        const size = f && (f.size < 1048576 ? `${Math.max(1, Math.round(f.size / 1024))} Ko` : `${(f.size / 1048576).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo`);
        hint.textContent = f ? `${f.name} (${size})` : text;
      });
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!check(form, note)) return;
      const subject = subjectOf(form);
      $('input[name="_subject"]', form).value = subject;
      btn.disabled = true;
      note.textContent = "Envoi en cours…";
      if (file && file.files.length) {
        flatten(form);
        HTMLFormElement.prototype.submit.call(form);
        return;
      }
      try {
        // point d'accès AJAX de FormSubmit (même adresse que le formulaire, préfixée par /ajax)
        const url = form.getAttribute("action").replace("formsubmit.co/", "formsubmit.co/ajax/");
        const body = { _subject: subject, _template: "table", _captcha: "false", _honey: val(form, "_honey"), ...Object.fromEntries(entries(form)) };
        const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body) });
        const res = await r.json().catch(() => ({}));
        if (!r.ok || String(res.success) !== "true") throw new Error(res.message || r.status);
        location.href = "/merci/";
      } catch (err) {
        btn.disabled = false;
        const tel = form.dataset.form === "urgence" ? ["+33631600135", "06 31 60 01 35"] : ["+33145726524", "01 45 72 65 24"];
        note.innerHTML = `L'envoi n'a pas abouti. Appelez-nous au <a href="tel:${tel[0]}">${tel[1]}</a> ou <a href="${esc(mailto(form))}">envoyez votre demande par e-mail</a>.`;
      }
    });
  });

  /* ───── Contact : onglets particulier / professionnel ───── */
  const box = $("[data-forms]");
  if (box) {
    const tabs = $$('[role="tab"]', box);
    const panel = (t) => document.getElementById(t.getAttribute("aria-controls"));
    const SHARED = ["prenom", "nom", "telephone", "email", "code_postal", "ville", "surface", "message"];
    const pick = (tab, focus) => {
      const from = panel(tabs.find((t) => t.classList.contains("is-on")) || tabs[0]), to = panel(tab);
      if (from !== to) SHARED.forEach((n) => { const a = $(`[name="${n}"]`, from), b = $(`[name="${n}"]`, to); if (a && b && a.value && !b.value) b.value = a.value; });
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle("is-on", on);
        t.setAttribute("aria-selected", on);
        t.tabIndex = on ? 0 : -1;
        panel(t).classList.toggle("is-off", !on);
      });
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => pick(t));
      t.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        pick(tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length], true);
      });
    });
    // arrivée depuis une page secteur, Sur mesure ou Showroom : le bon onglet, le bon choix
    const type = params.get("type");
    const PRO = { hotel: "Hôtel", restaurant: "Restaurant, café", boutique: "Boutique, corner" };
    const PART = { conception: "Conception par notre architecte", showroom: "Carrelage, parquet (showroom)" };
    if (PRO[type]) {
      pick(tabs[1]);
      const c = $(`input[name="etablissement"][value="${PRO[type]}"]`, panel(tabs[1]));
      if (c) c.checked = true;
    } else if (PART[type]) {
      const c = $(`input[name="travaux"][value="${PART[type]}"]`, panel(tabs[0]));
      if (c) c.checked = true;
    }
  }
  // arrivée depuis la bande « Devis gratuit » de l'accueil : e-mail déjà saisi
  const preMail = params.get("email");
  if (preMail) $$('form[data-form] input[name="email"]').forEach((i) => (i.value = preMail));

  /* ───── Urgence : problèmes du métier choisi, défilement, récapitulatif ───── */
  const uform = $('form[data-form="urgence"]');
  if (uform) {
    const sets = $$(".uform__demandes", uform);
    const area = $('textarea[name="message"]', uform);
    const recapEl = $("[data-recap]", uform);
    const recap = () => {
      const parts = ["metier", "probleme", "besoin", "lieu", "code_postal"].map((n) => val(uform, n)).filter(Boolean);
      recapEl.hidden = !val(uform, "probleme");
      recapEl.innerHTML = `<b>Votre demande</b>${parts.map((p) => `<span>${esc(p)}</span>`).join("")}`;
    };
    const showMetier = (slug) => sets.forEach((f) => {
      const on = f.dataset.metier === slug;
      f.hidden = !on;
      f.disabled = !on;
      if (on && area) area.placeholder = f.dataset.ph;
    });
    $$(".uform__metiers input", uform).forEach((i) => i.addEventListener("change", () => { showMetier(i.dataset.metier); recap(); }));
    const asked = params.get("metier");
    const askedInput = asked && $(`.uform__metiers input[data-metier="${asked}"]`, uform);
    if (askedInput) { askedInput.checked = true; showMetier(asked); }
    uform.addEventListener("change", recap);
    uform.addEventListener("input", (e) => { if (e.target.name === "code_postal") recap(); });

    // sur téléphone, les problèmes défilent : compteur « 3 / 8 »
    $$("[data-urail]", uform).forEach((rail) => {
      const count = $("[data-ucount]", rail.parentElement), tiles = [...rail.children];
      let raf = 0;
      const update = () => {
        raf = 0;
        const r = rail.getBoundingClientRect(), mid = r.left + r.width / 2;
        let k = 0, best = Infinity;
        tiles.forEach((t, i) => { const b = t.getBoundingClientRect(), d = Math.abs(b.left + b.width / 2 - mid); if (d < best) { best = d; k = i; } });
        if (rail.scrollLeft < 8) k = 0;
        count.textContent = `${k + 1} / ${tiles.length}`;
      };
      rail.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
      // un problème choisi reste bien visible dans la liste
      rail.addEventListener("change", (e) => {
        const t = e.target.closest(".uform__tile");
        if (t && rail.scrollWidth > rail.clientWidth) rail.scrollTo({ left: t.offsetLeft - rail.offsetLeft - (rail.clientWidth - t.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" });
      });
    });
  }
})();
