/*
 * ─────────────────────────────────────────────────────────────
 *  RÉALISATIONS EMBI : tout le site est généré depuis ce fichier
 *  (liste des réalisations, menu du haut, chantiers signature,
 *   et la page de chaque chantier : realisations/<id>.html)
 *
 *  Après chaque modification, lancez :  node scripts/build.js
 *  (régénère les pages des chantiers et le plan du site sitemap.xml)
 * ─────────────────────────────────────────────────────────────
 *  Pour ajouter un chantier : copiez un bloc { ... } et adaptez-le.
 *
 *  id       : identifiant unique, sans espace ni accent (sert d'adresse de la page)
 *  title    : nom du chantier
 *  category : "hotel" | "boutique" | "restaurant" | "particulier"
 *  images   : une ou plusieurs photos (la 1re sert de couverture) ; toutes
 *             s'affichent dans la galerie de la page du chantier.
 *             Photos locales possibles : "images/realisations/panache-2.jpg"
 *  featured : true → mis en avant dans « Chantiers signature »
 *
 *  Facultatif (affiché sur la page du chantier dès que c'est rempli) :
 *  lieu     : "Paris 9e"            annee    : "2018"
 *  deco     : "Nom du décorateur"   archi    : "Nom de l'architecte"
 *  surface  : "450 m²"              duree    : "12 semaines"
 *  travaux  : ["Gros œuvre", "Électricité", "Peinture", ...]
 *  text     : "Une phrase d'accroche."
 *  histoire : ["1er paragraphe…", "2e paragraphe…"]   ← le récit du chantier
 *
 *  Exemple complet :
 *  { id: "panache", title: "Hôtel Panache", category: "hotel", featured: true,
 *    lieu: "Paris 9e", annee: "2018", surface: "…", duree: "…",
 *    travaux: ["Rénovation complète", "Salles de bain", "Décoration"],
 *    text: "…", histoire: ["…", "…"],
 *    images: [OLD + "2018/01/Hotel-Panache-012.jpg", IMG + "panache-2.jpg"] },
 *
 *  Les photos pointent pour l'instant vers l'ancien site embi.fr.
 *  Lancez  scripts/telecharger-images.sh  pour les rapatrier dans le dépôt
 *  AVANT de fermer l'ancien site, puis remplacez la ligne « const OLD = … »
 *  par  const OLD = IMG;  et relancez  node scripts/build.js
 */
const IMG = (window.EMBI_ROOT || "") + "images/realisations/";
const OLD = "https://www.embi.fr/wp-content/uploads/";

window.EMBI_CATEGORIES = {
  hotel: "Hôtel",
  boutique: "Boutique",
  restaurant: "Restaurant",
  particulier: "Particulier",
};

// Galerie : photos numérotées de l'ancien site (celles qui n'existent pas sont masquées automatiquement)
const seq = (dir, name, from, to, pad = 2, sep = "_") =>
  Array.from({ length: to - from + 1 }, (_, k) => `${OLD}${dir}/${name}${sep}${String(from + k).padStart(pad, "0")}.jpg`);
const gal = (cover, list) => [OLD + cover, ...list.filter((u) => u !== OLD + cover)];

// Textes repris de l'ancien site embi.fr (rubrique Réalisations)
const MISE_AUX_NORMES = "Mise aux normes : sanitaires, circulations (PMR), sécurité incendie, électricité";

window.EMBI_PROJECTS = [
  { id: "panache", title: "Hôtel Panache", category: "hotel", featured: true,
    text: "Travaux d'embellissement et de rénovation de l'ensemble du bâtiment.",
    travaux: ["Embellissement", "Rénovation de l'ensemble du bâtiment", "Sanitaires", "Accessibilité PMR", "Sécurité incendie", "Électricité"],
    histoire: ["EMBI a mené les travaux d'embellissement et de rénovation de l'ensemble du bâtiment de l'Hôtel Panache.", MISE_AUX_NORMES + " : l'établissement a été remis aux normes hôtelières en parallèle des travaux de décoration."],
    images: gal("2018/01/Hotel-Panache-012.jpg", seq("2018/01", "Hotel-Panache", 1, 14, 3, "-")) },
  { id: "loro-piana", title: "Loro Piana", category: "boutique", featured: true,
    text: "Création complète de la boutique.",
    travaux: ["Création complète de la boutique"],
    histoire: ["Pour Loro Piana, EMBI a pris en charge la création complète de la boutique."],
    images: gal("2017/11/LORO-PIANA-03.jpg", seq("2017/11", "LORO-PIANA", 1, 8, 2, "-")) },
  { id: "colette", title: "Colette", category: "boutique",
    text: "Rénovation complète de la boutique.",
    travaux: ["Rénovation complète de la boutique"],
    histoire: ["EMBI a réalisé la rénovation complète de la boutique Colette."],
    images: gal("2018/01/COLETTE-5.jpg", seq("2018/01", "COLETTE", 1, 10, 1, "-")) },
  { id: "fish-club", title: "Fish Club", category: "restaurant", deco: "Dorothée Meilichzon",
    text: "Travaux d'embellissement et de rénovation, décoration signée Dorothée Meilichzon.",
    travaux: ["Embellissement", "Rénovation", "Décoration"],
    histoire: ["Pour le restaurant Fish Club, EMBI a réalisé les travaux d'embellissement et de rénovation sur une décoration imaginée par Dorothée Meilichzon."],
    images: gal("2017/09/FishClub_03.jpg", seq("2017/09", "FishClub", 1, 8)) },
  { id: "ambassadeur", title: "Hôtel Ambassadeur", category: "hotel",
    travaux: ["Embellissement", "Rénovation"],
    images: gal("2017/11/Hotel-ambassadeur-9.jpg", seq("2017/11", "Hotel-ambassadeur", 1, 12, 1, "-")) },
  { id: "byredo", title: "Byredo", category: "boutique", featured: true, lieu: "Le Bon Marché, Paris 7e",
    text: "Mise en place du corner Byredo au Bon Marché.",
    travaux: ["Mise en place d'un corner en grand magasin"],
    histoire: ["EMBI a réalisé la mise en place du corner Byredo au Bon Marché."],
    images: gal("2017/11/BYREDO-01.jpg", seq("2017/11", "BYREDO", 1, 8, 2, "-")) },
  { id: "le-grand-pigalle", title: "Le Grand Pigalle", category: "hotel",
    text: "Travaux d'embellissement et de rénovation de l'ensemble du bâtiment.",
    travaux: ["Embellissement", "Rénovation de l'ensemble du bâtiment"],
    histoire: ["EMBI a mené les travaux d'embellissement et de rénovation de l'ensemble du bâtiment du Grand Pigalle."],
    images: gal("2017/09/Grandpigalle_01.jpg", seq("2017/09", "Grandpigalle", 1, 8)) },
  { id: "particulier-3", title: "Appartement privé", category: "particulier",
    travaux: ["Rénovation d'appartement"],
    images: gal("2017/11/renovation-appartement-particulier-4.jpg", seq("2017/11", "renovation-appartement-particulier", 1, 8, 1, "-")) },
  { id: "hotel-paradis", title: "Hôtel Paradis", category: "hotel", featured: true, deco: "Dorothée Meilichzon",
    text: "Embellissement, rénovation et mise aux normes, décoration signée Dorothée Meilichzon.",
    travaux: ["Embellissement", "Rénovation", "Sanitaires", "Circulations"],
    histoire: ["À l'Hôtel Paradis, EMBI a réalisé les travaux d'embellissement et de rénovation sur une décoration imaginée par Dorothée Meilichzon.", "Les travaux ont compris la remise aux normes hôtelières des sanitaires et des circulations."],
    images: gal("2017/09/HotelParadis_01.jpg", seq("2017/09", "HotelParadis", 1, 8)) },
  { id: "harrods", title: "Tartine et Chocolat · Harrods", category: "boutique", lieu: "Harrods",
    text: "Travaux d'embellissement et de rénovation de la boutique Tartine et Chocolat chez Harrods.",
    travaux: ["Embellissement", "Rénovation", "Boutique en grand magasin"],
    histoire: ["EMBI a réalisé les travaux d'embellissement et de rénovation de la boutique Tartine et Chocolat chez Harrods."],
    images: gal("2017/11/boutique-harrods-tartine-et-chocolat-04.jpg", seq("2017/11", "boutique-harrods-tartine-et-chocolat", 1, 8, 2, "-")) },
  { id: "loustic", title: "Loustic", category: "restaurant", deco: "Dorothée Meilichzon",
    text: "Un ancien magasin entièrement transformé en restaurant, de la plomberie à la décoration.",
    travaux: ["Transformation complète", "Plomberie", "Décoration"],
    histoire: ["Loustic était à l'origine un magasin. EMBI a entièrement transformé le lieu et pris en charge tout le chantier, de la plomberie à la décoration.", "La décoration, chic et design, est signée Dorothée Meilichzon."],
    images: gal("2017/09/Loustic_01.jpg", seq("2017/09", "Loustic", 1, 8)) },
  { id: "bienvenue", title: "Hôtel Bienvenue", category: "hotel",
    text: "Travaux d'embellissement et de rénovation de l'ensemble du bâtiment.",
    travaux: ["Embellissement", "Rénovation de l'ensemble du bâtiment"],
    histoire: ["EMBI a mené les travaux d'embellissement et de rénovation de l'ensemble du bâtiment de l'Hôtel Bienvenue."],
    images: gal("2017/11/HOTEL-BIENVENUE-09.jpg", seq("2017/11", "HOTEL-BIENVENUE", 1, 14, 2, "-")) },
  { id: "petite-mendigote", title: "Petite Mendigote", category: "boutique",
    text: "Travaux d'embellissement et de rénovation de l'ensemble de la boutique.",
    travaux: ["Embellissement", "Rénovation complète de la boutique"],
    histoire: ["EMBI a réalisé les travaux d'embellissement et de rénovation de l'ensemble de la boutique Petite Mendigote."],
    images: gal("2017/11/PETITE-MENDIGOTE-01.jpg", seq("2017/11", "PETITE-MENDIGOTE", 1, 8, 2, "-")) },
  { id: "cafe-pinson", title: "Café Pinson", category: "restaurant", featured: true, deco: "Dorothée Meilichzon",
    text: "Rénovation complète et décoration, dans le respect de toutes les normes de la restauration.",
    travaux: ["Rénovation complète", "Décoration", "Normes de la restauration"],
    histoire: ["Pour le Café Pinson, EMBI a réalisé la rénovation complète et la décoration du restaurant, dans le respect de toutes les normes liées à la restauration.", "La décoration est signée Dorothée Meilichzon."],
    images: gal("2017/09/Pinson_01.jpg", seq("2017/09", "Pinson", 1, 8)) },
  { id: "mojo-kitchen", title: "Mojo Kitchen", category: "restaurant", deco: "Dorothée Meilichzon",
    text: "Embellissement, rénovation et mise aux normes, décoration signée Dorothée Meilichzon.",
    travaux: ["Embellissement", "Rénovation", "Sanitaires", "Accessibilité PMR", "Sécurité incendie", "Électricité"],
    histoire: ["Pour Mojo Kitchen, EMBI a réalisé les travaux sur une décoration imaginée par Dorothée Meilichzon.", MISE_AUX_NORMES + "."],
    images: gal("2017/09/midi2.jpg", ["2017/09/midi1.jpg", "2017/09/midi3.jpg", "2017/09/midi4.jpg", "2017/09/midi5.jpg"].map((f) => OLD + f)) },
  { id: "particulier-2", title: "Rénovation d'appartement", category: "particulier", archi: "Diego Delgado Elias",
    text: "Rénovation et mise aux normes d'un appartement, avec l'architecte Diego Delgado Elias.",
    travaux: ["Rénovation d'appartement", "Mise aux normes"],
    histoire: ["EMBI a réalisé la rénovation et la mise aux normes de cet appartement, sur un projet de l'architecte Diego Delgado Elias."],
    images: gal("2017/09/appartement-particulier-renovation-03.jpg", seq("2017/09", "appartement-particulier-renovation", 1, 8)) },
  { id: "triomphe", title: "Triomphe", category: "restaurant", deco: "Richard Lafond",
    text: "Embellissement, rénovation et mise aux normes, décoration signée Richard Lafond.",
    travaux: ["Embellissement", "Rénovation", "Sanitaires", "Accessibilité PMR", "Sécurité incendie", "Électricité"],
    histoire: ["Pour le restaurant Triomphe, EMBI a réalisé les travaux d'embellissement et de rénovation sur une décoration signée Richard Lafond.", MISE_AUX_NORMES + "."],
    images: gal("2017/09/Triomphe_01.jpg", seq("2017/09", "Triomphe", 1, 8)) },
];

// adresse de la page d'un chantier : realisations/<id>.html (pages générées par scripts/build.js)
window.EMBI_PROJECT_URL = (id) => `${window.EMBI_ROOT || ""}realisations/${encodeURIComponent(id)}.html`;
