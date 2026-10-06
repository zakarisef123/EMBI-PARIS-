/*
 * ─────────────────────────────────────────────────────────────
 *  RÉGLAGES DU SITE EMBI
 * ─────────────────────────────────────────────────────────────
 */
module.exports = {
  // Adresse du site. Sur Netlify, elle est fournie automatiquement (variable URL) :
  // quand le domaine embi.fr sera branché, rien à changer ici.
  siteUrl: process.env.URL || "https://embiparis.netlify.app",

  // PDF (CGV + catalogues) : "embi.fr" = liens vers l'ancien site,
  // "local" = fichiers déposés dans documents/ (voir documents/LISEZMOI.md).
  documents: "embi.fr",

  // Photos : les chantiers convertis par scripts/photos (assets/img/manifest.json) utilisent
  // toujours leurs WebP locaux ; les autres gardent les photos de l'ancien site.
  // "local" = signaler à la génération les chantiers qui n'ont pas encore leurs photos (voir README).
  photos: "embi.fr",

  // Formulaires (devis + questionnaire) envoyés par FormSubmit (formsubmit.co) vers cette adresse.
  // Après activation (voir README), vous pouvez remplacer l'e-mail par l'identifiant aléatoire
  // fourni par FormSubmit pour ne pas afficher l'adresse dans le code de la page.
  formsubmit: "sec@embi.fr",

  // Réseaux sociaux : collez les adresses complètes, les liens apparaissent dans le pied de page.
  social: {
    instagram: "",
    linkedin: "",
    facebook: "",
  },
};
