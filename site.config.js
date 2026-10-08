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

  // Carte « Autour du showroom » (page Showroom) : clé Google Maps du compte Google Cloud d'EMBI
  // (voir README, section « Carte du quartier » : API à activer et restriction de la clé aux adresses du site).
  // Vide = plan d'accès simple à la place de la carte interactive.
  // Attention : la clé « AIzaSyB41DRU… » des exemples Google ne marche que sur JSFiddle, pas sur le site.
  mapsApiKey: "",
  showroom: { lat: 48.8794777, lng: 2.2933696 },

  // Réseaux sociaux : collez les adresses complètes, les liens apparaissent dans le pied de page.
  social: {
    instagram: "",
    linkedin: "",
    facebook: "",
  },
};
