/*
 * ─────────────────────────────────────────────────────────────
 *  RÉALISATIONS EMBI : toutes les pages chantier, la grille des
 *  réalisations, les pages secteur et le menu sont générés depuis ce fichier.
 *  Après modification : node scripts/build.js (Netlify le fait tout seul).
 *
 *  id       : adresse de la page → /realisations/<id>/ (sans espace ni accent)
 *  oldId    : ancienne adresse (redirigée automatiquement)
 *  title    : nom du chantier
 *  category : "hotel" | "boutique" | "restaurant" | "particulier" | "savoir-faire"
 *             (savoir-faire = un métier montré sur plusieurs lieux : mosaïque, toitures…)
 *  featured : 1 à 5 → chantiers mis en avant (accueil + haut de /realisations/), dans cet ordre
 *  images   : chemins des photos sur l'ancien site (www.embi.fr/wp-content/uploads/…),
 *             la 1re sert de couverture. Quand les photos sont converties en local
 *             (scripts/photos), site.config.js → photos: "local" les remplace.
 *
 *  Facultatif (affiché sur la page du chantier dès que c'est rempli) :
 *  lieu, annee, surface, duree, deco (décoration), archi (architecte),
 *  travaux : ["…"], text : "une phrase", histoire : ["paragraphe", "…"]
 * ─────────────────────────────────────────────────────────────
 */
const CATEGORIES = {
  hotel: "Hôtel",
  boutique: "Boutique",
  restaurant: "Restaurant",
  particulier: "Particulier",
  "savoir-faire": "Savoir-faire",
};

// Galerie : photos numérotées de l'ancien site (celles qui n'existent pas sont masquées automatiquement)
const seq = (dir, name, from, to, pad = 2, sep = "_") =>
  Array.from({ length: to - from + 1 }, (_, k) => `${dir}/${name}${sep}${String(from + k).padStart(pad, "0")}.jpg`);
const gal = (cover, list) => [cover, ...list.filter((u) => u !== cover)];

// Textes repris de l'ancien site embi.fr (rubrique Réalisations)
const MISE_AUX_NORMES = "Mise aux normes : sanitaires, circulations (PMR), sécurité incendie, électricité";

const PROJECTS = [
  { id: "hotel-panache", oldId: "panache", title: "Hôtel Panache", category: "hotel", featured: 4,
    text: "Travaux d'embellissement et de rénovation de l'ensemble du bâtiment.",
    travaux: ["Embellissement", "Rénovation de l'ensemble du bâtiment", "Sanitaires", "Accessibilité PMR", "Sécurité incendie", "Électricité"],
    histoire: ["EMBI a mené les travaux d'embellissement et de rénovation de l'ensemble du bâtiment de l'Hôtel Panache.", MISE_AUX_NORMES + " : l'établissement a été remis aux normes hôtelières en parallèle des travaux de décoration."],
    images: gal("2018/01/Hotel-Panache-012.jpg", seq("2018/01", "Hotel-Panache", 1, 14, 3, "-")) },
  { id: "loro-piana", title: "Loro Piana", category: "boutique", featured: 1,
    text: "Création complète de la boutique.",
    travaux: ["Création complète de la boutique"],
    histoire: ["Pour Loro Piana, EMBI a pris en charge la création complète de la boutique."],
    images: gal("2017/11/LORO-PIANA-03.jpg", seq("2017/11", "LORO-PIANA", 1, 8, 2, "-")) },
  { id: "colette", title: "Colette", category: "boutique", featured: 3,
    text: "Rénovation complète de la boutique.",
    travaux: ["Rénovation complète de la boutique"],
    histoire: ["EMBI a réalisé la rénovation complète de la boutique Colette."],
    images: gal("2018/01/COLETTE-5.jpg", seq("2018/01", "COLETTE", 1, 10, 1, "-")) },
  { id: "fish-club", title: "Fish Club", category: "restaurant", featured: 5, deco: "Dorothée Meilichzon",
    text: "Travaux d'embellissement et de rénovation, décoration signée Dorothée Meilichzon.",
    travaux: ["Embellissement", "Rénovation", "Décoration"],
    histoire: ["Pour le restaurant Fish Club, EMBI a réalisé les travaux d'embellissement et de rénovation sur une décoration imaginée par Dorothée Meilichzon."],
    images: gal("2017/09/FishClub_03.jpg", seq("2017/09", "FishClub", 1, 8)) },
  { id: "hotel-ambassadeur", oldId: "ambassadeur", title: "Hôtel Ambassadeur", category: "hotel",
    travaux: ["Embellissement", "Rénovation"],
    images: gal("2017/11/Hotel-ambassadeur-9.jpg", seq("2017/11", "Hotel-ambassadeur", 1, 12, 1, "-")) },
  { id: "byredo", title: "Byredo", category: "boutique", featured: 2, lieu: "Le Bon Marché, Paris 7e",
    text: "Mise en place du corner Byredo au Bon Marché.",
    travaux: ["Mise en place d'un corner en grand magasin"],
    histoire: ["EMBI a réalisé la mise en place du corner Byredo au Bon Marché."],
    images: gal("2017/11/BYREDO-01.jpg", seq("2017/11", "BYREDO", 1, 8, 2, "-")) },
  { id: "le-grand-pigalle", title: "Le Grand Pigalle", category: "hotel",
    text: "Travaux d'embellissement et de rénovation de l'ensemble du bâtiment.",
    travaux: ["Embellissement", "Rénovation de l'ensemble du bâtiment"],
    histoire: ["EMBI a mené les travaux d'embellissement et de rénovation de l'ensemble du bâtiment du Grand Pigalle."],
    images: gal("2017/09/Grandpigalle_01.jpg", seq("2017/09", "Grandpigalle", 1, 8)) },
  { id: "appartement-prive", oldId: "particulier-3", title: "Appartement privé", category: "particulier",
    travaux: ["Rénovation d'appartement"],
    images: gal("2017/11/renovation-appartement-particulier-4.jpg", seq("2017/11", "renovation-appartement-particulier", 1, 8, 1, "-")) },
  { id: "hotel-paradis", title: "Hôtel Paradis", category: "hotel", deco: "Dorothée Meilichzon",
    text: "Embellissement, rénovation et mise aux normes, décoration signée Dorothée Meilichzon.",
    travaux: ["Embellissement", "Rénovation", "Sanitaires", "Circulations"],
    histoire: ["À l'Hôtel Paradis, EMBI a réalisé les travaux d'embellissement et de rénovation sur une décoration imaginée par Dorothée Meilichzon.", "Les travaux ont compris la remise aux normes hôtelières des sanitaires et des circulations."],
    images: gal("2017/09/HotelParadis_01.jpg", seq("2017/09", "HotelParadis", 1, 8)) },
  { id: "tartine-et-chocolat-harrods", oldId: "harrods", title: "Tartine et Chocolat · Harrods", category: "boutique", lieu: "Harrods",
    text: "Travaux d'embellissement et de rénovation de la boutique Tartine et Chocolat chez Harrods.",
    travaux: ["Embellissement", "Rénovation", "Boutique en grand magasin"],
    histoire: ["EMBI a réalisé les travaux d'embellissement et de rénovation de la boutique Tartine et Chocolat chez Harrods."],
    images: gal("2017/11/boutique-harrods-tartine-et-chocolat-04.jpg", seq("2017/11", "boutique-harrods-tartine-et-chocolat", 1, 8, 2, "-")) },
  { id: "loustic", title: "Loustic", category: "restaurant", deco: "Dorothée Meilichzon",
    text: "Un ancien magasin entièrement transformé en restaurant, de la plomberie à la décoration.",
    travaux: ["Transformation complète", "Plomberie", "Décoration"],
    histoire: ["Loustic était à l'origine un magasin. EMBI a entièrement transformé le lieu et pris en charge tout le chantier, de la plomberie à la décoration.", "La décoration, chic et design, est signée Dorothée Meilichzon."],
    images: gal("2017/09/Loustic_01.jpg", seq("2017/09", "Loustic", 1, 8)) },
  { id: "hotel-bienvenue", oldId: "bienvenue", title: "Hôtel Bienvenue", category: "hotel",
    text: "Travaux d'embellissement et de rénovation de l'ensemble du bâtiment.",
    travaux: ["Embellissement", "Rénovation de l'ensemble du bâtiment"],
    histoire: ["EMBI a mené les travaux d'embellissement et de rénovation de l'ensemble du bâtiment de l'Hôtel Bienvenue."],
    images: gal("2017/11/HOTEL-BIENVENUE-09.jpg", seq("2017/11", "HOTEL-BIENVENUE", 1, 14, 2, "-")) },
  { id: "petite-mendigote", title: "Petite Mendigote", category: "boutique",
    text: "Travaux d'embellissement et de rénovation de l'ensemble de la boutique.",
    travaux: ["Embellissement", "Rénovation complète de la boutique"],
    histoire: ["EMBI a réalisé les travaux d'embellissement et de rénovation de l'ensemble de la boutique Petite Mendigote."],
    images: gal("2017/11/PETITE-MENDIGOTE-01.jpg", seq("2017/11", "PETITE-MENDIGOTE", 1, 8, 2, "-")) },
  { id: "cafe-pinson", title: "Café Pinson", category: "restaurant", deco: "Dorothée Meilichzon",
    text: "Rénovation complète et décoration, dans le respect de toutes les normes de la restauration.",
    travaux: ["Rénovation complète", "Décoration", "Normes de la restauration"],
    histoire: ["Pour le Café Pinson, EMBI a réalisé la rénovation complète et la décoration du restaurant, dans le respect de toutes les normes liées à la restauration.", "La décoration est signée Dorothée Meilichzon."],
    images: gal("2017/09/Pinson_01.jpg", seq("2017/09", "Pinson", 1, 8)) },
  { id: "mojo-kitchen", title: "Mojo Kitchen", category: "restaurant", deco: "Dorothée Meilichzon",
    text: "Embellissement, rénovation et mise aux normes, décoration signée Dorothée Meilichzon.",
    travaux: ["Embellissement", "Rénovation", "Sanitaires", "Accessibilité PMR", "Sécurité incendie", "Électricité"],
    histoire: ["Pour Mojo Kitchen, EMBI a réalisé les travaux sur une décoration imaginée par Dorothée Meilichzon.", MISE_AUX_NORMES + "."],
    images: gal("2017/09/midi2.jpg", ["2017/09/midi1.jpg", "2017/09/midi3.jpg", "2017/09/midi4.jpg", "2017/09/midi5.jpg"]) },
  { id: "renovation-appartement", oldId: "particulier-2", title: "Rénovation d'appartement", category: "particulier", archi: "Diego Delgado Elias", lieu: "Rue de Maubeuge, Paris",
    text: "Rénovation et mise aux normes d'un appartement, avec l'architecte Diego Delgado Elias.",
    travaux: ["Rénovation d'appartement", "Mise aux normes"],
    histoire: ["EMBI a réalisé la rénovation et la mise aux normes de cet appartement, sur un projet de l'architecte Diego Delgado Elias."],
    images: gal("2017/09/appartement-particulier-renovation-03.jpg", seq("2017/09", "appartement-particulier-renovation", 1, 8)) },
  { id: "triomphe", title: "Triomphe", category: "restaurant", deco: "Richard Lafond",
    text: "Embellissement, rénovation et mise aux normes, décoration signée Richard Lafond.",
    travaux: ["Embellissement", "Rénovation", "Sanitaires", "Accessibilité PMR", "Sécurité incendie", "Électricité"],
    histoire: ["Pour le restaurant Triomphe, EMBI a réalisé les travaux d'embellissement et de rénovation sur une décoration signée Richard Lafond.", MISE_AUX_NORMES + "."],
    images: gal("2017/09/Triomphe_01.jpg", seq("2017/09", "Triomphe", 1, 8)) },

  { id: "appartement-renovation-complete", title: "Appartement rénové de A à Z", category: "particulier",
    text: "Rénovation complète d'un appartement parisien : parquet, cuisine, salles d'eau, plomberie et électricité.",
    travaux: ["Rénovation complète", "Parquet chêne", "Cuisine équipée", "Salle d'eau et douche à l'italienne", "Plomberie", "Électricité"],
    histoire: ["EMBI a entièrement rénové cet appartement : parquet en chêne dans toutes les pièces, cuisine équipée, salles d'eau en faïence verte et blanche, plomberie et électricité refaites à neuf."],
    images: [] },

  { id: "appartement-haussmannien", title: "Appartement haussmannien", category: "particulier",
    text: "Rénovation complète d'un appartement haussmannien : parquet en point de Hongrie, cuisine avec îlot, salles de bains et rangements sur mesure.",
    travaux: ["Rénovation complète", "Parquet en point de Hongrie", "Cuisine avec îlot", "Salles de bains", "Rangements sur mesure"],
    histoire: ["EMBI a entièrement rénové cet appartement haussmannien en gardant ses moulures et ses cheminées : parquet en point de Hongrie, cuisine ouverte avec îlot central, salles de bains en faïence à chevrons et rangements sur mesure dans les chambres et l'entrée."],
    images: [] },

  { id: "appartement-lumineux", title: "Appartement lumineux", category: "particulier",
    text: "Rénovation complète d'un appartement ancien : parquet en point de Hongrie, salle d'eau en laiton, rangements sur mesure et verrière.",
    travaux: ["Rénovation complète", "Parquet en point de Hongrie", "Salle d'eau", "Robinetterie laiton", "Rangements sur mesure", "Verrière intérieure", "Papiers peints"],
    histoire: ["EMBI a entièrement rénové cet appartement ancien : parquet en point de Hongrie, salle d'eau avec robinetterie en laiton et papier peint, placards sur mesure de couleur, verrière cintrée et couloir habillé de lambris et de papier peint."],
    images: [] },
  { id: "appartement-rue-saint-dominique", title: "Appartement rue Saint-Dominique", category: "particulier", lieu: "Rue Saint-Dominique, Paris 7e",
    text: "Rénovation complète d'un appartement : menuiseries sur mesure vert sauge, cuisine blanche, salle d'eau en carreaux verts.",
    travaux: ["Rénovation complète", "Menuiseries sur mesure", "Cuisine", "Salle d'eau", "Parquet"],
    histoire: ["Rue Saint-Dominique, EMBI a entièrement rénové cet appartement : entrée et rangements en menuiserie sur mesure vert sauge, cuisine blanche ouverte par une verrière, salle d'eau en petits carreaux verts et chambres avec tête de lit en bois."],
    images: [] },
  { id: "cafe-joyeux-klesia", title: "Café Joyeux · Klesia", category: "restaurant",
    text: "Aménagement du Café Joyeux dans les locaux de Klesia : salle de restaurant, comptoirs et boutique.",
    travaux: ["Aménagement de restaurant", "Comptoirs et boutique", "Peinture et décoration", "Luminaires"],
    histoire: ["Dans les locaux de Klesia, EMBI a aménagé le Café Joyeux : la grande salle aux murs jaunes, les comptoirs de service, la boutique et les espaces de repas."],
    images: [] },

  // Savoir-faire : photos uniquement en local (assets/img/projets/<id>/), pas d'équivalent sur l'ancien site
  { id: "mosaique", title: "Mosaïque", category: "savoir-faire", lieu: "Paris",
    text: "Tapis d'entrée, sols et comptoirs en mosaïque, dessinés et posés sur mesure pour des cafés, des hôtels et des restaurants parisiens.",
    travaux: ["Tapis d'entrée au nom du lieu", "Sols en mosaïque", "Habillage de comptoirs", "Lettrage sur mesure"],
    histoire: ["EMBI réalise des ouvrages en mosaïque sur mesure : tapis d'entrée qui portent le nom du lieu, sols complets et habillages de comptoirs.", "Parmi ces réalisations : le Café de Flore, Le Select, le Café Manfred, Le Grand Pigalle, l'Hôtel Panache, le Café Le Piquet, Leda, Le Saint Jean, Le Grand Pan et le Café de Paris."],
    images: [] },
  { id: "toitures-zinguerie", title: "Toitures et zinguerie", category: "savoir-faire", lieu: "Paris",
    text: "Couvertures en zinc et en tuiles, lucarnes, verrières et ouvrages de zinguerie sur des immeubles parisiens.",
    travaux: ["Couverture en zinc", "Couverture en tuiles", "Lucarnes", "Verrières", "Zinguerie", "Fenêtres de toit"],
    histoire: ["Sur les toits de Paris, EMBI refait les couvertures en zinc et en tuiles, avec les lucarnes, les verrières et toute la zinguerie : gouttières, descentes, épis de faîtage."],
    images: [] },
  { id: "ravalement-rue-nollet", title: "Ravalement rue Nollet", category: "savoir-faire", lieu: "Paris 17e", annee: "2019-2020",
    text: "Ravalement de la façade en pierre d'un immeuble d'angle haussmannien, rue Nollet à Paris 17e.",
    travaux: ["Ravalement de façade", "Échafaudage sur rue", "Balcons et modénatures"],
    histoire: ["Rue Nollet, à Paris 17e, EMBI a mené en 2019 et 2020 le ravalement de la façade en pierre d'un immeuble d'angle haussmannien, de l'échafaudage jusqu'aux balcons et aux modénatures."],
    images: [] },
  { id: "charpente-bois", title: "Charpente bois", category: "savoir-faire",
    text: "Charpente bois, plancher et escalier neufs dans un grand volume sous verrière.",
    travaux: ["Charpente bois", "Plancher et solivage", "Trémie et escalier"],
    histoire: ["Dans ce grand volume sous verrière, EMBI a posé une charpente bois neuve, créé un plancher sur solivage et ouvert une trémie pour l'escalier."],
    images: [] },
];

module.exports = { CATEGORIES, PROJECTS };
