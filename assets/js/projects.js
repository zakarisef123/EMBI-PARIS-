/*
 * ─────────────────────────────────────────────────────────────
 *  RÉALISATIONS EMBI : tout le site est généré depuis ce fichier
 *  (liste des réalisations, menu du haut, chantiers signature,
 *   et la page de chaque chantier : projet.html?p=<id>)
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
 *    images: [OLD + "2018/01/Hotel-Panache-012.jpg", "images/realisations/panache-2.jpg"] },
 *
 *  Les photos pointent pour l'instant vers l'ancien site embi.fr.
 *  Lancez  scripts/telecharger-images.sh  pour les rapatrier dans le dépôt
 *  AVANT de fermer l'ancien site, puis remplacez OLD par "images/realisations/".
 */
const OLD = "https://www.embi.fr/wp-content/uploads/";

window.EMBI_CATEGORIES = {
  hotel: "Hôtel",
  boutique: "Boutique",
  restaurant: "Restaurant",
  particulier: "Particulier",
};

window.EMBI_PROJECTS = [
  { id: "panache",          title: "Hôtel Panache",        category: "hotel",       featured: true, images: [OLD + "2018/01/Hotel-Panache-012.jpg"] },
  { id: "loro-piana",       title: "Loro Piana",           category: "boutique",    featured: true, images: [OLD + "2017/11/LORO-PIANA-03.jpg"] },
  { id: "colette",          title: "Colette",              category: "boutique",    images: [OLD + "2018/01/COLETTE-5.jpg"] },
  { id: "fish-club",        title: "Fish Club",            category: "restaurant",  images: [OLD + "2017/09/FishClub_03.jpg"] },
  { id: "ambassadeur",      title: "Hôtel Ambassadeur",    category: "hotel",       images: [OLD + "2017/11/Hotel-ambassadeur-9.jpg"] },
  { id: "byredo",           title: "Byredo",               category: "boutique",    featured: true, images: [OLD + "2017/11/BYREDO-01.jpg"] },
  { id: "le-grand-pigalle", title: "Le Grand Pigalle",     category: "hotel",       images: [OLD + "2017/09/Grandpigalle_01.jpg"] },
  { id: "particulier-3",    title: "Appartement privé",    category: "particulier", images: [OLD + "2017/11/renovation-appartement-particulier-4.jpg"] },
  { id: "hotel-paradis",    title: "Hôtel Paradis",        category: "hotel",       featured: true, images: [OLD + "2017/09/HotelParadis_01.jpg"] },
  { id: "harrods",          title: "Tartine et Chocolat · Harrods", category: "boutique", images: [OLD + "2017/11/boutique-harrods-tartine-et-chocolat-04.jpg"] },
  { id: "loustic",          title: "Loustic",              category: "restaurant",  images: [OLD + "2017/09/Loustic_01.jpg"] },
  { id: "bienvenue",        title: "Hôtel Bienvenue",      category: "hotel",       images: [OLD + "2017/11/HOTEL-BIENVENUE-09.jpg"] },
  { id: "petite-mendigote", title: "Petite Mendigote",     category: "boutique",    images: [OLD + "2017/11/PETITE-MENDIGOTE-01.jpg"] },
  { id: "cafe-pinson",      title: "Café Pinson",          category: "restaurant",  featured: true, images: [OLD + "2017/09/Pinson_01.jpg"] },
  { id: "mojo-kitchen",     title: "Mojo Kitchen",         category: "restaurant",  images: [OLD + "2017/09/midi2.jpg"] },
  { id: "particulier-2",    title: "Rénovation d'appartement", category: "particulier", images: [OLD + "2017/09/appartement-particulier-renovation-03.jpg"] },
  { id: "triomphe",         title: "Triomphe",             category: "restaurant",  images: [OLD + "2017/09/Triomphe_01.jpg"] },
];

// adresse de la page d'un chantier
window.EMBI_PROJECT_URL = (id) => `projet.html?p=${encodeURIComponent(id)}`;
