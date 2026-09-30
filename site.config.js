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

  // Photos : "embi.fr" = photos de l'ancien site,
  // "local" = photos converties en WebP par scripts/photos (voir README).
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
